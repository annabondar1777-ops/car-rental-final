import { sql } from "./_db.js";

export const handler = async () => {
  try {
    const rows = await sql`SELECT * FROM bookings ORDER BY id DESC`;
    return { statusCode: 200, body: JSON.stringify({ bookings: rows }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
