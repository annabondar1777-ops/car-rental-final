// /netlify/functions/crm-list.js
export const handler = async () => {
  try {
    const REPO = process.env.REPO_FULL;     // например: annabondar1777-ops/car-rental-final
    const BRANCH = process.env.BRANCH || "main";
    const TOKEN = process.env.GITHUB_TOKEN;
    const path = "data/clients.json";

    // читаем файл из GitHub
    const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" }
    });

    if (r.status === 404) {
      // файла ещё нет — вернём пустой список
      return resp({ ok: true, clients: [] });
    }
    if (!r.ok) {
      const t = await r.text();
      return resp({ ok: false, error: `GitHub read failed: ${r.status} ${t}` }, 502);
    }

    const j = await r.json();
    const decoded = Buffer.from(j.content || "", "base64").toString("utf-8");
    const clients = JSON.parse(decoded || "[]");
    return resp({ ok: true, clients });
  } catch (e) {
    return resp({ ok: false, error: String(e) }, 502);
  }
};

function resp(obj, status = 200) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
