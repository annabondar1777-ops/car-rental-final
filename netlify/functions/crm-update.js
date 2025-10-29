// netlify/functions/cal-update.js
import { sql, ok, bad, err, preflight } from './_db.js';

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return preflight();
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const b = JSON.parse(event.body || "{}");
    const id = Number(b.id);
    if (!id) return bad(400, "id required");

    const fields = ["name", "phone", "email", "car", "date_from", "date_to", "comment", "status"];
    const keys = fields.filter(k => b[k] !== undefined);
    if (!keys.length) return bad(400, "nothing to update");

    const setSql = keys.map((k, i) => `${k} = $${i+1}`).join(", ");
    const values = keys.map(k => b[k]);

    const rows = await sql`UPDATE bookings SET ${sql.raw(setSql)} WHERE id = ${id} RETURNING *`;
    return ok({ client: rows[0] });
  }
  catch (e) { return err(e); }
}
