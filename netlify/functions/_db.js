// netlify/functions/_db.js
import { neon } from "@neondatabase/serverless";

// Netlify Neon кладёт URI в эти переменные окружения.
// Если у тебя есть UNPOOLED — используем его, иначе pooled.
const url =
  process.env.NETLIFY_DATABASE_URL_UNPOOLED || process.env.NETLIFY_DATABASE_URL;

if (!url) {
  throw new Error("NETLIFY_DATABASE_URL(_UNPOOLED) not set");
}

// Единый экспорт для всех функций
export const sql = neon(url);
