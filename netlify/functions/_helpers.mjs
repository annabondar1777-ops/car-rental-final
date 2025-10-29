// ✅ helpers: общие функции для всех netlify functions (без node-fetch)

import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.NETLIFY_DATABASE_URL);

// ------------------ RESPONSE HELPERS ------------------ //

export function ok(data = {}) {
  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ ok: true, data }),
  };
}

export function bad(status = 400, msg = "Bad Request") {
  return {
    statusCode: status,
    headers: corsHeaders(),
    body: JSON.stringify({ ok: false, error: msg }),
  };
}

// ------------------ ERROR WRAPPER ------------------ //

export function err(e) {
  console.error("❌ ERROR:", e);
  return {
    statusCode: 500,
    headers: corsHeaders(),
    body: JSON.stringify({ ok: false, error: e.message || "Server error" }),
  };
}

// ------------------ CORS ------------------ //

export function preflight(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: "",
    };
  }
  return null;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };
}
