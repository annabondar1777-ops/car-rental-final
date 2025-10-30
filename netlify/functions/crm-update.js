import { readJsonFile, writeJsonFile, ok, err } from './_helpers.mjs';

const PATH = 'data/clients.json';

export const handler = async (evt) => {
  if (evt.httpMethod !== 'POST') return err('Use POST');
  try {
    const input = JSON.parse(evt.body || '{}');

    // нормализуем
    const client = {
      id: input.id || (Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6)),
      name: input.name?.trim() || '',
      phone: input.phone?.trim() || '',
      email: input.email?.trim() || '',
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
    const i = list.findIndex(x => x.id === client.id);
    if (i === -1) list.unshift(client); else list[i] = client;

    await writeJsonFile(PATH, list, sha, 'crm: upsert');
    return ok({ id: client.id });
  } catch (e) {
    return err(e.message);
  }
};

