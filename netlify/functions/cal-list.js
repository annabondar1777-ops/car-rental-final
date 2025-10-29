// netlify/functions/cal-list.js
import { sql, ok, bad, err, preflight } from './_db.js';

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;

  try {
    const rows = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    return ok(rows);
  }
  catch (e) { return err(e); }
}
