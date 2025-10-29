// netlify/functions/crm-create.mjs
import { getStore } from '@netlify/blobs';

const fetch = globalThis.fetch;

const ok = (data = {}) => ({
  statusCode: 200,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: true, ...data })
});
const bad = (code, msg) => ({
  statusCode: code,
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ ok: false, error: msg })
});

export const handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return bad(405, 'Use POST');

    const input = JSON.parse(event.body || '{}');
    const {
      carId, name, phone, email, msg,
      startDate, endDate, source = 'site-or-admin'
    } = input;

    if (!name || !phone) return bad(400, 'name & phone required');

    const now = new Date().toISOString();
    const leadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 1) Сохраняем заявку
    const crm = getStore('crm');
    const indexKey = 'index.json';
    const list = (await crm.get(indexKey, { type: 'json' })) || [];

    const lead = { leadId, createdAt: now, carId, name, phone, email, msg, startDate, endDate, source, status: 'new' };

    await crm.set(`leads/${leadId}.json`, JSON.stringify(lead), {
      metadata: { contentType: 'application/json' }
    });

    list.unshift({ leadId, createdAt: now, carId, name, phone, email, startDate, endDate, status: 'new' });
    await crm.set(indexKey, JSON.stringify(list), {
      metadata: { contentType: 'application/json' }
    });

    // 2) Если есть даты — сразу в календарь (без пересечений)
    if (carId && startDate && endDate) {
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
          leadId, createdAt: now
        });
        await cal.set(key, JSON.stringify(bookings), {
          metadata: { contentType: 'application/json' }
        });
      } else {
        lead.status = 'conflict';
        await crm.set(`leads/${leadId}.json`, JSON.stringify(lead), {
          metadata: { contentType: 'application/json' }
        });
      }
    }

    // 3) Письмо админу (опционально через Resend)
    const { RESEND_API_KEY, ADMIN_EMAIL, SITE_URL } = process.env;
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      try {
        const subject = `Новая заявка #${leadId}${carId ? ` (авто: ${carId})` : ''}`;
        const html = `
          <h2>Новая заявка</h2>
          <p><b>Имя:</b> ${name || ''}</p>
          <p><b>Телефон:</b> ${phone || ''}</p>
          <p><b>Email:</b> ${email || ''}</p>
          ${carId ? `<p><b>Авто:</b> ${carId}</p>` : ''}
          ${(startDate && endDate) ? `<p><b>Даты:</b> ${startDate} → ${endDate}</p>` : ''}
          ${msg ? `<p><b>Сообщение:</b> ${msg}</p>` : ''}
          ${SITE_URL ? `<p><a href="${SITE_URL}/admin/" target="_blank">Открыть админку</a></p>` : ''}
          <p>ID: ${leadId}</p>
        `;
        const fromDomain = SITE_URL ? new URL(SITE_URL).hostname : 'example.com';

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `CRM <notify@${fromDomain}>`,
            to: [ADMIN_EMAIL],
            subject,
            html
          })
        });
      } catch (e) {
        console.log('Email send error:', e?.message);
      }
    }

    return ok({ leadId });
  } catch (e) {
    console.error(e);
    return bad(500, e?.message || 'server error');
  }
};
