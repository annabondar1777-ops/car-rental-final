// netlify/functions/_db.js
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const ok = (data) => ({
  statusCode: 200,
  headers: CORS,
  body: JSON.stringify({ ok: true, data })
});

const bad = (code = 400, msg = 'Bad request') => ({
  statusCode: code,
  headers: CORS,
  body: JSON.stringify({ ok: false, error: msg })
});

const err = (e) => ({
  statusCode: 500,
  headers: CORS,
  body: JSON.stringify({ ok: false, error: e?.message || String(e) })
});

const preflight = (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  return null;
};

export { sql, ok, bad, err, preflight };
