const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST')
    return { statusCode: 405, headers:{'Access-Control-Allow-Origin':'*'}, body: 'Method not allowed' };

  try {
    const body = JSON.parse(event.body || '{}');
    if (!body.id) body.id = Date.now().toString(36) + '-' + (body.car_id || 'x');

    const store = getStore({ name: 'calendar' });
    const data  = (await store.get('bookings', { type: 'json' })) || { bookings: [] };

    const i = data.bookings.findIndex(b => b.id === body.id);
    if (i === -1) data.bookings.push(body); else data.bookings[i] = { ...data.bookings[i], ...body };

    await store.set('bookings', data, { type: 'json' });

    return { statusCode: 200, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:true, id: body.id }) };
  } catch (e) {
    return { statusCode: 500, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
