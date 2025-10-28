import { sql, ok, bad, err, preflight } from "./_db.mjs";

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "POST") return bad(405, "Method not allowed");

  try {
    const b = JSON.parse(event.body || "{}");
    if (!b.car && !b.car_id) return bad(400, "car or car_id required");
    if (!b.date_from || !b.date_to) return bad(400, "date_from and date_to required");

    // (опционально) проверка пересечений
    // const overlap = await sql`
    //   SELECT 1 FROM bookings
    //   WHERE (car_id = ${b.car_id} OR ${b.car_id} IS NULL)
    //     AND NOT (${b.date_to} < date_from OR ${b.date_from} > date_to)
    //   LIMIT 1;
    // `;
    // if (overlap.length) return bad(409, "Dates overlap");

    const rows = await sql`
      INSERT INTO bookings (car_id, car, name, phone, date_from, date_to, comment, created_at)
      VALUES (${b.car_id || null}, ${b.car || ""}, ${b.name || ""}, ${b.phone || ""},
              ${b.date_from}, ${b.date_to}, ${b.comment || ""}, NOW())
      RETURNING *;
    `;
    return ok({ booking: rows[0] });
  } catch (e) { return err(e); }
}
