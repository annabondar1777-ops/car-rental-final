// /netlify/functions/crm-delete.js
export const handler = async (event) => {
  if (event.httpMethod !== "POST") return resp({ ok: false, error: "Use POST" }, 405);

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return resp({ ok: false, error: "Missing id" }, 400);

    const REPO = process.env.REPO_FULL;
    const BRANCH = process.env.BRANCH || "main";
    const TOKEN = process.env.GITHUB_TOKEN;
    const path = "data/clients.json";

    // читаем файл
    const get = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" }
    });

    if (get.status === 404) return resp({ ok: true }); // нечего удалять
    if (!get.ok) {
      const t = await get.text();
      return resp({ ok: false, error: `GitHub read failed: ${get.status} ${t}` }, 502);
    }

    const jj = await get.json();
    const sha = jj.sha;
    const decoded = Buffer.from(jj.content || "", "base64").toString("utf-8");
    const list = JSON.parse(decoded || "[]").filter((x) => x.id !== id);

    const newContent = Buffer.from(JSON.stringify(list, null, 2), "utf-8").toString("base64");
    const put = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({
        message: `delete client ${id}`,
        content: newContent,
        branch: BRANCH,
        sha
      })
    });

    if (!put.ok) {
      const t = await put.text();
      return resp({ ok: false, error: `GitHub write failed: ${put.status} ${t}` }, 502);
    }

    return resp({ ok: true });
  } catch (e) {
    return resp({ ok: false, error: String(e) }, 502);
  }
};

function resp(obj, status = 200) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}
