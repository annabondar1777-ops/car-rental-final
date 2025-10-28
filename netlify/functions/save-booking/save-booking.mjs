// netlify/functions/save-booking.js
import { sql, ok, bad, err, preflight } from './db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST')    return bad(405, 'Method not allowed');

  try {
    const b = JSON.parse(event.body || '{}');
    if (!b.car && !b.car_id) return bad(400, 'car or car_id required');
    if (!b.date_from || !b.date_to)   return bad(400, 'date_from and date_to required');

    const rows = await sql`
      INSERT INTO bookings (car_id, car, name, phone, date_from, date_to, comment)
      VALUES (${b.car_id || null}, ${b.car || ''}, ${b.name || ''}, ${b.phone || ''},
              ${b.date_from}, ${b.date_to}, ${b.comment || ''})
      RETURNING *;
    `;
    return ok({ booking: rows[0] });
  } catch (e) { return err(e); }
}
