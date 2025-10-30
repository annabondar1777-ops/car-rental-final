import { readJsonFile, writeJsonFile, ok, err } from './_helpers.mjs';
const PATH = 'data/bookings.json';

export const handler = async (evt) => {
  if (evt.httpMethod !== 'POST') return err('Use POST');
  try {
    const { id } = JSON.parse(evt.body || '{}');
    if (!id) return err('Missing id');

    const { data, sha } = await readJsonFile(PATH, []);
    const list = (Array.isArray(data) ? data : []).filter(x => x.id !== id);
    await writeJsonFile(PATH, list, sha, 'calendar: delete');
    return ok({});
  } catch (e) {
    return err(e.message);
  }
};
