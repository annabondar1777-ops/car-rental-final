export const handler = async () => {
  try {
    const repo = process.env.REPO_FULL;
    if (!repo) throw new Error('Missing REPO_FULL');
    const url = `https://raw.githubusercontent.com/${repo}/main/data/bookings.json?ts=${Date.now()}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`fetch bookings.json: ${r.status}`);
    const data = await r.json();
    return resp(200, { ok: true, bookings: Array.isArray(data.bookings) ? data.bookings : [] });
  } catch (e) {
    return resp(500, { ok: false, error: String(e.message || e) });
  }
};
function resp(status, json){ return { statusCode: status, headers:{'Content-Type':'application/json'}, body: JSON.stringify(json)} }
