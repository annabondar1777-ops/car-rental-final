// netlify/functions/crm-list.mjs
import { getStore } from '@netlify/blobs';

export const handler = async () => {
  try {
    const crm = getStore('crm');
    const items = (await crm.get('index.json', { type: 'json' })) || [];
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ok: true, items })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: e?.message }) };
  }
};
