// netlify/functions/save-booking/save-booking.mjs
import { sql, ok, bad, err, preflight } from '../_db.js';

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== 'POST') return bad(405, 'Method not allowed');

  try {
    const b = JSON.parse(event.body || '{}');
    const { car_id, date_from, date_to, name, phone, email, comment } = b;

    if (!car_id || !date_from || !date_to) {
      return bad(400, 'car_id, date_from, date_to required');
    }

    const rows = await sql`
      INSERT INTO bookings (car_id, date_from, date_to, name, phone, email, comment)
      VALUES (${car_id}, ${date_from}, ${date_to}, ${name||null}, ${phone||null}, ${email||null}, ${comment||null})
      RETURNING id
    `;
    return ok({ id: rows[0].id });
  } catch (e) {
    return err(e);
  }
}
