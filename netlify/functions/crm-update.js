// netlify/functions/crm-update.js
import { sql, ok, bad, err, preflight } from './_db.js';

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const c = JSON.parse(event.body || "{}");
    const id = Number(c.id);
    if (!id) return bad(400, "id required");

    const fields = ["name", "phone", "email", "car", "date_from", "date_to", "comment", "status"];
    const keys = fields.filter(k => c[k] !== undefined);
    if (!keys.length) return bad(400, "nothing to update");

    const setSql = keys.map((k, i) => `${k} = $${i+1}`).join(", ");
    const values = keys.map(k => c[k]);

    const rows = await sql`UPDATE clients SET ${sql.raw(setSql)} WHERE id = ${id} RETURNING *`;
    return ok({ client: rows[0] });
  }
  catch (e) { return err(e); }
}
