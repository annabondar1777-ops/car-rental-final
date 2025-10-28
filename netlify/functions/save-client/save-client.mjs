import { sql } from "./_db.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method not allowed" };

  try {
    const c = JSON.parse(event.body || "{}");
    const rows = await sql`
      INSERT INTO clients (name, phone, email, car, date_from, date_to, comment, status)
      VALUES (${c.name}, ${c.phone}, ${c.email}, ${c.car}, ${c.date_from}, ${c.date_to}, ${c.comment}, 'new')
      RETURNING id
    `;
    return { statusCode: 200, body: JSON.stringify({ ok:true, id: rows[0]?.id }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
