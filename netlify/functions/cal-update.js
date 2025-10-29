// netlify/functions/cal-update.mjs
import { getStore } from '@netlify/blobs';

const fetch = globalThis.fetch;
const ok = (data = {}) => ({ statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: true, ...data }) });
const bad = (code, msg) => ({ statusCode: code, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ok: false, error: msg }) });

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return bad(405, 'Use POST');

    const { carId, name, phone, email, startDate, endDate, msg } = JSON.parse(event.body || '{}');
    if (!carId || !startDate || !endDate) return bad(400, 'carId, startDate, endDate required');

    // создаём lead (это запишет в CRM и отправит письмо)
    const res = await fetch('/.netlify/functions/crm-create', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ carId, name, phone, email, startDate, endDate, msg, source: 'site' })
    });

    const j = await res.json();
    if (!j.ok) return bad(500, j.error || 'crm-create failed');
    const leadId = j.leadId;

    // на всякий случай продублируем запись в календарь (если crm-create не сделал)
    const cal = getStore('calendar');
    const key = `bookings/${carId}.json`;
    const bookings = (await cal.get(key, { type: 'json' })) || [];

    const s = new Date(startDate);
    const e = new Date(endDate);
    const overlap = bookings.some(b => !(new Date(b.end) < s || new Date(b.start) > e));
    if (!overlap) {
      bookings.push({
        start: s.toISOString().slice(0, 10),
        end: e.toISOString().slice(0, 10),
        leadId,
        createdAt: new Date().toISOString()
      });
      await cal.set(key, JSON.stringify(bookings), { metadata: { contentType: 'application/json' } });
    }

    return ok({ leadId, bookings });
  } catch (e) {
    console.error(e);
    return bad(500, e?.message || 'server error');
  }
};
