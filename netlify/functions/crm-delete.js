// netlify/functions/crm-delete.js
import { sql, ok, bad, err, preflight } from './db.js';

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return preflight();
  if (event.httpMethod !== 'POST')    return bad(405, 'Method not allowed');

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return bad(400, 'id required');
    await sql`DELETE FROM clients WHERE id = ${id}`;
    return ok({ id });
  } catch (e) { return err(e); }
}
