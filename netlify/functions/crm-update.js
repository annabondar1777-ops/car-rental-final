// netlify/functions/crm-update.mjs
import { getStore } from '@netlify/blobs';

const ok = (x = {}) => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: true, ...x })
});
const bad = (c, m) => ({
  statusCode: c,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: false, error: m })
});

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return bad(405, 'Use POST');
    const input = JSON.parse(event.body || '{}');

    const now = new Date().toISOString();
    const id = input.id || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6));

    const client = {
      id,
      name: (input.name || '').trim(),
      phone: (input.phone || '').trim(),
      email: (input.email || '').trim(),
      car: (input.car || '').trim(),
      date_from: input.date_from || '',
      date_to: input.date_to || '',
      status: input.status || 'new',
      comment: (input.comment || '').trim(),
      createdAt: input.createdAt || now,
      updatedAt: now
    };

    const store = getStore('crm');

    // прочитаем список из любого "старого" ключа
    const readAny = async () =>
      (await store.get('clients.json', { type: 'json' })) ||
      (await store.get('crm.json', { type: 'json' })) ||
      (await store.get('index.json', { type: 'json' })) ||
      [];

    let list = await readAny();
    if (!Array.isArray(list)) list = [];

    const i = list.findIndex((x) => x.id === id);
    if (i === -1) list.unshift(client);
    else list[i] = { ...list[i], ...client };

    // ПИШЕМ ВО ВСЕ ТРИ КЛЮЧА (чтобы всё стало совместимо)
    const json = JSON.stringify(list);
    const meta = { metadata: { contentType: 'application/json' } };
    await store.set('clients.json', json, meta);
    await store.set('crm.json', json, meta);
    await store.set('index.json', json, meta);

    // детальная запись
    await store.set(`clients/${id}.json`, JSON.stringify(client), meta);

    return ok({ id });
  } catch (e) {
    return bad(500, e?.message || 'server error');
  }
};

