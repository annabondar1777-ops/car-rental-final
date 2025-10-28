// netlify/functions/db.js
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.NETLIFY_DATABASE_URL);

// удобные ответы + CORS
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type' };
export const ok  = (data = {}) => ({ statusCode: 200, headers: cors, body: JSON.stringify({ ok: true, ...data }) });
export const bad = (code = 400, msg = 'Bad request') => ({ statusCode: code, headers: cors, body: JSON.stringify({ ok: false, error: msg }) });
export const err = (e) => ({ statusCode: 500, headers: cors, body: JSON.stringify({ ok: false, error: e?.message || String(e) }) });
export const preflight = () => ({ statusCode: 200, headers: cors, body: '' });
