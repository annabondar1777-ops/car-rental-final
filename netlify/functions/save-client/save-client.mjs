// netlify/functions/save-client.js
import { sql, ok, bad, err, preflight } from './db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST')    return bad(405, 'Method not allowed');

  try {
    const b = JSON.parse(event.body || '{}');

    // минимально требуемые поля
    if (!b.name || !b.phone) return bad(400, 'name and phone required');

    const rows = await sql`
      INSERT INTO clients (name, phone, email, car, date_from, date_to, comment, status)
      VALUES (${b.name || ''}, ${b.phone || ''}, ${b.email || ''}, ${b.car || ''},
              ${b.date_from || null}, ${b.date_to || null}, ${b.comment || ''},
              ${b.status || 'new'})
      RETURNING *;
    `;
    return ok({ client: rows[0] });
  } catch (e) { return err(e); }
}
