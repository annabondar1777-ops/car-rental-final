// netlify/functions/crm-delete.js
import { sql, ok, bad, err, preflight } from './_db.js';

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return bad(400, "id required");

    await sql`DELETE FROM clients WHERE id = ${id}`;
    return ok({ id });
  }
  catch (e) { return err(e); }
}
