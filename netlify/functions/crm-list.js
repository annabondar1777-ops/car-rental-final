// netlify/functions/crm-list.mjs
import { getStore } from '@netlify/blobs';

export const handler = async () => {
  try {
    const store = getStore('crm');

    // читаем из любого "старого" файла
    const tryRead = async (key) => await store.get(key, { type: 'json' });
    let list =
      (await tryRead('clients.json')) ||
      (await tryRead('crm.json')) ||
      (await tryRead('index.json')) ||
      [];

    if (!Array.isArray(list)) list = [];

    // последние сверху
    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // ВСЕГДА возвращаем оба ключа для совместимости
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, clients: list, items: list })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message }) };
  }
};
