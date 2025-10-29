// netlify/functions/save-cars/save-cars.mjs
import { sql, ok, bad, err, preflight } from '../_db.js';
// ВАЖНО: не импортируем 'node-fetch' — в Node 18+ fetch глобальный

export async function handler(event) {
  const pf = preflight(event); if (pf) return pf;
  if (event.httpMethod !== 'POST') return bad(405, 'Method not allowed');

  try {
    const b = JSON.parse(event.body || '{}');

    const {
      id,
      name,
      year,
      transmission,
      fuel,
      price_per_day,
      images,
      description,
      city_mpg,      // расход город
      highway_mpg,   // расход трасса
      bookable
    } = b;

    const imgs = Array.isArray(images)
      ? images
      : (typeof images === 'string'
          ? images.split('\n').map(s => s.trim()).filter(Boolean)
          : []);

    let rows;
    if (id) {
      rows = await sql`
        UPDATE cars SET
          name=${name},
          year=${year},
          transmission=${transmission},
          fuel=${fuel},
          price_per_day=${price_per_day},
          images=${JSON.stringify(imgs)},
          description=${description},
          city_mpg=${city_mpg},
          highway_mpg=${highway_mpg},
          bookable=${!!bookable}
        WHERE id=${id}
        RETURNING *`;
    } else {
      rows = await sql`
        INSERT INTO cars
          (name, year, transmission, fuel, price_per_day, images, description, city_mpg, highway_mpg, bookable)
        VALUES
          (${name}, ${year}, ${transmission}, ${fuel}, ${price_per_day}, ${JSON.stringify(imgs)},
           ${description}, ${city_mpg}, ${highway_mpg}, ${!!bookable})
        RETURNING *`;
    }

    return ok(rows[0]);
  } catch (e) {
    return err(e);
  }
}
