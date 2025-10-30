import { readJsonFile, writeJsonFile, ok, err } from './_helpers.mjs';
const PATH = 'data/bookings.json';

export const handler = async (evt) => {
  if (evt.httpMethod !== 'POST') return err('Use POST');
  try {
    const input = JSON.parse(evt.body || '{}');
    const item = {
      id: input.id || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)),
      name: input.name?.trim() || '',
      phone: input.phone?.trim() || '',
      car_id: input.car_id?.trim() || '',
      car: input.car?.trim() || '',
      date_from: input.date_from || '',
      date_to: input.date_to || '',
      status: input.status || 'new',
      comment: input.comment?.trim() || '',
      createdAt: input.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, sha } = await readJsonFile(PATH, []);
    const list = Array.isArray(data) ? data : [];
    const i = list.findIndex(x => x.id === item.id);
    if (i === -1) list.unshift(item); else list[i] = item;

    await writeJsonFile(PATH, list, sha, 'calendar: upsert');
    return ok({ id: item.id });
  } catch (e) {
    return err(e.message);
  }
};
