import { sql } from "./_db.js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST")
    return { statusCode: 405, body: "Method not allowed" };

  try {
    const { id } = JSON.parse(event.body || "{}");
    if (!id) return { statusCode: 400, body: "id required" };
    await sql`DELETE FROM clients WHERE id=${id}`;
    return { statusCode: 200, body: JSON.stringify({ ok:true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok:false, error: e.message }) };
  }
};
