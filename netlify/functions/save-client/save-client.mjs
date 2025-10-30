// netlify/functions/save-client.mjs
const REPO   = process.env.REPO_FULL;     // напр.: "annabondar1777-ops/car-rental-final"
const BRANCH = process.env.BRANCH || "main";
const TOKEN  = process.env.GITHUB_TOKEN;
const FILE   = "data/clients.json";

const gh = (path, init={}) => fetch(`https://api.github.com${path}`, {
  ...init,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "netlify-fn",
    ...(init.headers || {})
  }
});

const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
const unb64 = (s) => Buffer.from(s || "", "base64").toString("utf8");

async function readList() {
  const r = await gh(`/repos/${REPO}/contents/${encodeURIComponent(FILE)}?ref=${BRANCH}`);
  if (r.status === 404) return { list: [], sha: null };
  if (!r.ok) throw new Error(`GET ${FILE}: ${r.status}`);
  const j = await r.json();
  const txt = unb64(j.content);
  let list = [];
  try { list = JSON.parse(txt || "[]"); } catch {}
  return { list: Array.isArray(list) ? list : [], sha: j.sha || null };
}

async function writeList(list, sha, msg) {
  const body = {
    message: msg || "update clients.json",
    content: b64(JSON.stringify(list, null, 2)),
    branch: BRANCH,
    ...(sha ? { sha } : {})
  };
  const r = await gh(`/repos/${REPO}/contents/${encodeURIComponent(FILE)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`PUT ${FILE}: ${r.status} ${t}`);
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return resp({ ok: false, error: "Use POST" }, 405);
  }
  try {
    const payload = JSON.parse(event.body || "{}");
    const op = (payload.op || "upsert").toLowerCase();

    const { list, sha } = await readList();

    if (op === "delete") {
      const id = payload.id;
      if (!id) return resp({ ok: false, error: "Missing id" }, 400);
      const next = list.filter(x => x.id !== id);
      await writeList(next, sha, `clients: delete ${id}`);
      return resp({ ok: true });
    }

    // upsert
    const now = new Date().toISOString();
    const id = payload.id || (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2,6));
    const rec = {
      id,
      name: (payload.name || "").trim(),
      phone: (payload.phone || "").trim(),
      email: (payload.email || "").trim(),
      car: (payload.car || "").trim(),
      date_from: payload.date_from || "",
      date_to: payload.date_to || "",
      status: payload.status || "new",
      comment: (payload.comment || "").trim(),
      updatedAt: now,
      createdAt: payload.createdAt || now
    };

    const i = list.findIndex(x => x.id === rec.id);
    if (i === -1) list.unshift(rec); else list[i] = { ...(list[i]||{}), ...rec };
    await writeList(list, sha, `clients: upsert ${rec.id}`);
    return resp({ ok: true, id: rec.id });
  } catch (e) {
    return resp({ ok: false, error: String(e) }, 502);
  }
};

function resp(obj, status=200){
  return { statusCode: status, headers: { "Content-Type":"application/json" }, body: JSON.stringify(obj) };
}
