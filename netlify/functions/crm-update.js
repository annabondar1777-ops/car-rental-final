import { sql } from "./_db.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method not allowed" };

  try {
    const { id, status, name, phone, email, car, date_from, date_to, comment } = JSON.parse(event.body || "{}");
    if (!id) return { statusCode: 400, body: "id required" };

    await sql`
      UPDATE clients SET
        status = COALESCE(${status}, status),
        name = COALESCE(${name}, name),
        phone = COALESCE(${phone}, phone),
        email = COALESCE(${email}, email),
        car = COALESCE(${car}, car),
        date_from = COALESCE(${date_from}, date_from),
        date_to = COALESCE(${date_to}, date_to),
        comment = COALESCE(${comment}, comment)
      WHERE id=${id}
    `;

    return { statusCode: 200, body: JSON.stringify({ ok:true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
