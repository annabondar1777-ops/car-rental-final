import { sql, ok, bad, err, preflight } from "./_db.mjs";

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const b = JSON.parse(event.body || "{}");
    const id = Number(b.id);
    if (!id) return bad(400, "id required");

    const fields = ["name","phone","email","car","date_from","date_to","comment","status"];
    const keys = fields.filter(k => k in b);
    if (!keys.length) return bad(400, "nothing to update");

    const setSql = keys.map((k,i) => `${k} = $${i+1}`).join(", ");
    const values = keys.map(k => b[k]);

    const rows = await sql(
      `UPDATE clients SET ${setSql} WHERE id = $${keys.length+1} RETURNING *`,
      [...values, id]
    );
    return ok({ client: rows[0] });
  } catch (e) { return err(e); }
}
