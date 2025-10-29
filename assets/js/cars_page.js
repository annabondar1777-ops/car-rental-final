
(async function(){
  const wrap = document.getElementById('cars');
  if(!wrap) return;
  const cfg = window.SITE_CFG || {};
  const url = (cfg && cfg.DATA_URL) ? cfg.DATA_URL : '/data/cars.json';
  const lang = (localStorage.getItem('lang') || 'ro').toLowerCase();
  function pick(obj, fallback=''){
    if(!obj) return fallback||'';
    if(typeof obj==='string') return obj;
    return obj[lang] || obj.ro || obj.ru || obj.en || fallback || '';
  }
  function safe(val){ return (val==null?'':String(val)); }
  try{
    const r = await fetch(url + '?v=' + Date.now(), {cache:'no-store'});
    const j = await r.json();
    const cars = (j && j.cars) || [];
    if(!cars.length){ wrap.innerHTML = '<p style="opacity:.8">Momentan nu sunt automobile publicate.</p>'; return; }
    const html = cars.map(c=>{
      const title = pick(c.name, c.name_ro || c.name_ru || c.name_en || c.name);
      const desc  = pick(c.description, c.description_ro || c.description_ru || c.description_en || '');
      const img   = (c.images && c.images[0]) || '';
      const price = (c.price_per_day || c.price) ? `<div class="price">€ ${safe(c.price_per_day||c.price)}/zi</div>` : '';
      return `<div class="car-card">
        <div class="thumb" style="background-image:url('${img}')"></div>
        <div class="info">
          <h3>${safe(title)}</h3>
          <p>${safe(desc)}</p>
          ${price}
        </div>
      </div>`;
    }).join('');
    wrap.innerHTML = `<div class="cars-grid">${html}</div>`;
  }catch(e){
    console.error(e);
    wrap.innerHTML = '<p>Не удалось загрузить автопарк.</p>';
  }
})();
