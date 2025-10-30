export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return resp(405, { ok: false, error: 'Use POST' });

    const repo = process.env.REPO_FULL;
    const token = process.env.GITHUB_TOKEN;
    if (!repo || !token) throw new Error('Missing REPO_FULL or GITHUB_TOKEN');

    const input = JSON.parse(event.body || '{}');
    if (!input.id) {
      input.id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
      input.createdAt = new Date().toISOString();
    }
    input.updatedAt = new Date().toISOString();

    // 1) прочитать текущий файл + sha
    const { json, sha } = await readFileFromGit(repo, token, 'data/crm.json');
    const list = Array.isArray(json.clients) ? json.clients : [];

    const i = list.findIndex((x) => x.id === input.id);
    if (i === -1) list.unshift(input);
    else list[i] = { ...list[i], ...input };

    // 2) записать обратно
    await writeFileToGit(repo, token, 'data/crm.json', { clients: list }, sha, 'CRM: upsert client');

    return resp(200, { ok: true, id: input.id });
  } catch (e) {
    return resp(500, { ok: false, error: String(e.message || e) });
  }
};

async function readFileFromGit(repo, token, path) {
  const api = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const r = await fetch(api, { headers: { Authorization: `token ${token}`, 'User-Agent': 'netlify-fn' } });
  if (!r.ok) throw new Error(`read ${path}: ${r.status}`);
  const data = await r.json();
  const content = Buffer.from(data.content, data.encoding).toString('utf8');
  return { json: JSON.parse(content || '{}'), sha: data.sha };
}

async function writeFileToGit(repo, token, path, json, sha, message) {
  const api = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const body = {
    message: message || `update ${path}`,
    content: Buffer.from(JSON.stringify(json, null, 2)).toString('base64'),
    sha
  };
  const r = await fetch(api, {
    method: 'PUT',
    headers: { Authorization: `token ${token}`, 'User-Agent': 'netlify-fn', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`write ${path}: ${r.status}`);
}

function resp(status, json) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(json) };
}

