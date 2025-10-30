const REPO_FULL = process.env.REPO_FULL;           // "owner/repo"
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;     // classic token
const BRANCH = 'main';

const api = (path, init = {}) =>
  fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      ...init.headers
    }
  });

const toBase64 = (str) => Buffer.from(str, 'utf8').toString('base64');
const fromBase64 = (b64) => Buffer.from(b64, 'base64').toString('utf8');

export async function readJsonFile(pathInRepo, fallback = []) {
  // GET /repos/{owner}/{repo}/contents/{path}?ref=BRANCH
  const res = await api(`/repos/${REPO_FULL}/contents/${encodeURIComponent(pathInRepo)}?ref=${BRANCH}`);
  if (res.status === 404) return { data: fallback, sha: null };
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const j = await res.json();
  const raw = fromBase64(j.content || '');
  let data = fallback;
  try { data = JSON.parse(raw); } catch { /* keep fallback */ }
  return { data, sha: j.sha || null };
}

export async function writeJsonFile(pathInRepo, data, sha, message) {
  const body = {
    message: message || `update ${pathInRepo}`,
    content: toBase64(JSON.stringify(data, null, 2)),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const res = await api(`/repos/${REPO_FULL}/contents/${encodeURIComponent(pathInRepo)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status}`);
  return await res.json();
}

export function ok(body) {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ ok: true, ...body })
  };
}
export function err(msg, code = 200) {
  return {
    statusCode: code,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify({ ok: false, error: String(msg) })
  };
}

