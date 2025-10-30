export const handler = async () => {
  try {
    const repo = process.env.REPO_FULL;
    if (!repo) throw new Error('Missing REPO_FULL');

    // читаем crm.json прямо из GitHub (без токена репо публичный)
    const url = `https://raw.githubusercontent.com/${repo}/main/data/crm.json?ts=${Date.now()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch crm.json: ${r.status}`);
    const data = await r.json();

    return resp(200, { ok: true, clients: Array.isArray(data.clients) ? data.clients : [] });
  } catch (e) {
    return resp(500, { ok: false, error: String(e.message || e) });
  }
};

function resp(status, json) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json)
  };
}
