import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.NETLIFY_DATABASE_URL);

export const handler = async () => {
  try {
    const clients = await sql`SELECT * FROM clients ORDER BY id DESC`;
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: true, clients }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ ok: false, error: e.message }),
    };
  }
};

