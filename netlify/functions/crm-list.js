import { readJsonFile, ok, err } from './_helpers.mjs';

const PATH = 'data/clients.json';

export const handler = async () => {
  try {
    const { data } = await readJsonFile(PATH, []);
    return ok({ clients: Array.isArray(data) ? data : [] });
  } catch (e) {
    return err(e.message);
  }
};
