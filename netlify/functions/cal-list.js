import { readJsonFile, ok, err } from './_helpers.mjs';
const PATH = 'data/bookings.json';

export const handler = async () => {
  try {
    const { data } = await readJsonFile(PATH, []);
    return ok({ bookings: Array.isArray(data) ? data : [] });
  } catch (e) {
    return err(e.message);
  }
};

