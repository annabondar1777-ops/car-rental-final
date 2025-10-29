// netlify/functions/_db.js
import { neon } from '@neondatabase/serverless';

const cors = () => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
});

// Соединение с Neon (URL уже есть в переменных окружения Netlify)
export const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Ответы-утилиты
export const ok = (data) => ({
  statusCode: 200,
  headers: cors(),
  body: JSON.stringify({ ok: true, data })
});

export const bad = (code = 400, message = 'Bad request') => ({
  statusCode: code,
  headers: cors(),
  body: JSON.stringify({ ok: false, error: message })
});

export const err = (e) => ({
  statusCode: 500,
  headers: cors(),
  body: JSON.stringify({ ok: false, error: e?.message || String(e) })
});

// CORS preflight
export const preflight = (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  return null;
};
