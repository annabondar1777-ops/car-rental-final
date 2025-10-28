import { sql, ok, bad, err, preflight } from "./_db.mjs";

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const b = JSON.parse(event.body || "{}");
    if (!b.name && !b.phone) return bad(400, "name or phone required");

    const rows = await sql`
      INSERT INTO clients (name, phone, email, car, date_from, date_to, comment, status, created_at)
      VALUES (${b.name || ""}, ${b.phone || ""}, ${b.email || ""}, ${b.car || ""},
              ${b.date_from || null}, ${b.date_to || null}, ${b.comment || ""},
              ${b.status || "new"}, NOW())
      RETURNING *;
    `;
    return ok({ client: rows[0] });
  } catch (e) { return err(e); }
}
