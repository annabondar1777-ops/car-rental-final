import { sql } from "./_db.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method not allowed" };

  try {
    const b = JSON.parse(event.body || "{}");
    if (!b.car_id || !b.date_from || !b.date_to)
      return { statusCode: 400, body: "car_id, date_from, date_to required" };

    // проверка пересечений
    const overlap = await sql`
      SELECT id FROM bookings
      WHERE car_id=${b.car_id}
        AND NOT (${b.date_to} < date_from OR ${b.date_from} > date_to)
      LIMIT 1
    `;
    if (overlap.length) {
      return { statusCode: 409, body: JSON.stringify({ ok:false, error: "Dates overlap" }) };
    }

    const rows = await sql`
      INSERT INTO bookings (car_id, date_from, date_to, name, phone, comment)
      VALUES (${b.car_id}, ${b.date_from}, ${b.date_to}, ${b.name}, ${b.phone}, ${b.comment})
      RETURNING id
    `;

    return { statusCode: 200, body: JSON.stringify({ ok:true, id: rows[0]?.id }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
