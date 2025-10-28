import { neon } from "@neondatabase/serverless";

// Поддержим оба варианта от Netlify Neon:
const url =
  process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
  process.env.NETLIFY_DATABASE_URL;

if (!url) {
  throw new Error("NETLIFY_DATABASE_URL(_UNPOOLED) is not set");
}

export const sql = neon(url);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
};

export const preflight = (event) =>
  event.httpMethod === "OPTIONS"
    ? { statusCode: 200, headers: CORS, body: "" }
    : null;

export const ok = (data = {}) => ({
  statusCode: 200,
  headers: CORS,
  body: JSON.stringify({ ok: true, ...data })
});

export const bad = (code = 400, msg = "Bad request") => ({
  statusCode: code,
  headers: CORS,
  body: JSON.stringify({ ok: false, error: msg })
});

export const err = (e) => ({
  statusCode: 500,
  headers: CORS,
  body: JSON.stringify({ ok: false, error: e?.message || String(e) })
});
