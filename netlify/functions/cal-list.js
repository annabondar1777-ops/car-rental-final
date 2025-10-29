const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  try {
    const store = getStore({ name: 'calendar' });
    const data = (await store.get('bookings', { type: 'json' })) || { bookings: [] };
    return { statusCode: 200, headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:true, ...data }) };
  } catch (e) {
    return { statusCode: 500, headers:{'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({ ok:false, error:e.message }) };
  }
};
