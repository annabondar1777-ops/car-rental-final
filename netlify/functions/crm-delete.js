const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers:{'Access-Control-Allow-Origin':'*'}, body: 'Method not allowed' };

  try {
    const { id } = JSON.parse(event.body || '{}');
    if (!id) return { statusCode: 400, headers:{'Access-Control-Allow-Origin':'*'}, body: 'id required' };

    const store = getStore({ name: 'crm' });
    const data  = (await store.get('clients', { type: 'json' })) || { clients: [] };

    await store.set('clients', { clients: data.clients.filter(c => c.id !== id) }, { type: 'json' });

    return { statusCode: 200, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:true }) };
  } catch (e) {
    return { statusCode: 500, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
