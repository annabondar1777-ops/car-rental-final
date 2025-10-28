import { sql, ok, err, preflight, bad } from "./_db.mjs";

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "GET") return bad(405, "Method not allowed");

  try {
    const car_id = event.queryStringParameters?.car_id || null;
    const rows = car_id
      ? await sql`SELECT * FROM bookings WHERE car_id=${car_id} ORDER BY id DESC`
      : await sql`SELECT * FROM bookings ORDER BY id DESC`;
    return ok({ bookings: rows });
  } catch (e) { return err(e); }
}
