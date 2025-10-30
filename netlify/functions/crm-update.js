// /netlify/functions/crm-update.js
export const handler = async (event) => {
  if (event.httpMethod !== "POST") return resp({ ok: false, error: "Use POST" }, 405);

  try {
    const REPO = process.env.REPO_FULL;
    const BRANCH = process.env.BRANCH || "main";
    const TOKEN = process.env.GITHUB_TOKEN;
    const path = "data/clients.json";

    const input = JSON.parse(event.body || "{}");

    // нормализуем запись
    const now = new Date().toISOString();
    const id = input.id || (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6));
    const rec = {
      id,
      name: (input.name || "").trim(),
      phone: (input.phone || "").trim(),
      email: (input.email || "").trim(),
      car: (input.car || "").trim(),
      date_from: input.date_from || "",
      date_to: input.date_to || "",
      status: input.status || "new",
      comment: (input.comment || "").trim(),
      createdAt: input.createdAt || now,
      updatedAt: now
    };

    // читаем текущий файл + SHA
    const get = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}?ref=${BRANCH}`, {
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" }
    });

    let list = [];
    let sha = undefined;

    if (get.status === 200) {
      const jj = await get.json();
      sha = jj.sha;
      const decoded = Buffer.from(jj.content || "", "base64").toString("utf-8");
      list = JSON.parse(decoded || "[]");
    } else if (get.status !== 404) {
      const t = await get.text();
      return resp({ ok: false, error: `GitHub read failed: ${get.status} ${t}` }, 502);
    }

    // апдейт/создание
    const idx = list.findIndex((x) => x.id === rec.id);
    if (idx === -1) list.unshift(rec);
    else list[idx] = rec;

    // пишем назад
    const newContent = Buffer.from(JSON.stringify(list, null, 2), "utf-8").toString("base64");
    const put = await fetch(`https://api.github.com/repos/${REPO}/contents/${encodeURIComponent(path)}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/vnd.github+json" },
      body: JSON.stringify({
        message: `update clients.json (id=${rec.id})`,
        content: newContent,
        branch: BRANCH,
        sha
      })
    });

    if (!put.ok) {
      const t = await put.text();
      return resp({ ok: false, error: `GitHub write failed: ${put.status} ${t}` }, 502);
    }

    return resp({ ok: true, id: rec.id });
  } catch (e) {
    return resp({ ok: false, error: String(e) }, 502);
  }
};

function resp(obj, status = 200) {
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(obj) };
}

