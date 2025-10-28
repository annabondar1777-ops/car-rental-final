import { sql, ok, err, preflight, bad } from "./_db.mjs";

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== "GET") return bad(405, "Method not allowed");

  try {
    const q = (event.queryStringParameters?.q || "").trim();
    const rows = q
      ? await sql`
          SELECT * FROM clients
           WHERE name  ILIKE ${'%' + q + '%'}
              OR phone ILIKE ${'%' + q + '%'}
           ORDER BY id DESC
        `
      : await sql`SELECT * FROM clients ORDER BY id DESC`;
    return ok({ clients: rows });
  } catch (e) { return err(e); }
}
