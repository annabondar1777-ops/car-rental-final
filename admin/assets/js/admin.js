
(function(){
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>Array.from(p.querySelectorAll(s));
  $$('.tab-btn').forEach(b=>b.addEventListener('click', ()=>{
    $$('.tab').forEach(t=>t.classList.remove('active'));
    $('#tab-'+b.dataset.tab).classList.add('active');
  }));

  // ----- Cars -----
  const LS='rentcar_admin_cars_local_v1';
  const form=$('#car-form'); const list=$('#cars-list'); const imagesEl=$('#car-images');
  function uid(){ return 'id_'+Math.random().toString(36).slice(2,9); }
  function load(){ try{ return JSON.parse(localStorage.getItem(LS)||'[]'); }catch(e){ return []; } }
  function save(arr){ localStorage.setItem(LS, JSON.stringify(arr)); }
  function render(arr){
    list.innerHTML = arr.map(c=>`<tr>
      <td>${(c.name&& (c.name.ro||c.name.ru||c.name.en)) || '-'}</td>
      <td>${c.year||'-'}</td>
      <td>${c.transmission||'-'}</td>
      <td>${c.fuel||'-'}</td>
      <td>${c.price_per_day||'-'}</td>
      <td>${c.published?'<span class="badge">✓</span>':'—'}</td>
      <td><button class="btn btn-quiet" data-edit="${c.id}">Ред.</button>
          <button class="btn btn-quiet" data-del="${c.id}">Удалить</button></td>
    </tr>`).join('');
  }
  function collect(){
    const get = n => {const el=$('[name="'+n+'"]', form); return el ? (el.type==='checkbox'? el.checked : el.value.trim()) : '';};
    const getML = p => ({ ru: ($(`[name="${p}"]`, form)?.value.trim() || "") });
    const images = normalizeImagesInput(imagesEl.value||'');
    return { id: $('[name=id]', form)?.value || uid(),
      name: { ru: ($('[name="name"]', form)?.value.trim() || '') }, description: { ru: ($('[name="description"]', form)?.value.trim() || '') },
      year:get('year'), transmission:get('transmission'), fuel:get('fuel'),
      price_per_day:get('price_per_day'), bookable: !!get('bookable'), published:true, images };
  }
  function fill(c){
    const set=(n,v)=>{const el=$('[name="'+n+'"]', form); if(el) (el.type==='checkbox')? el.checked=!!v : el.value=v||'';};
    const setML=(p,o)=>{ set(p+'_ro',o?.ro||''); set(p+'_ru',o?.ru||''); set(p+'_en',o?.en||''); };
    set('name', c.name?.ru || c.name?.ro || c.name?.en || ''); set('description', (c.description?.ru || c.description?.ro || c.description?.en || ''));
    set('year', c.year); set('transmission', c.transmission);
    set('fuel', c.fuel); set('price_per_day', c.price_per_day);
    set('bookable', c.bookable);
    imagesEl.value=(c.images||[]).join('\n'); renderPreview();
  }
  function normalizeImagesInput(str){
  if(!str) return [];
  const parts = String(str).replace(/[,\s]+/g,'\n').split(/\n+/);
  return Array.from(new Set(parts.map(s=>s.trim()).filter(Boolean)));
}
function renderPreview(){
    const box=$('#images-preview');
    const urls = normalizeImagesInput(imagesEl.value||'');
    box.innerHTML = urls.map(u=>`<div style="position:relative;border:1px solid rgba(255,255,255,.12);border-radius:10px;overflow:hidden">
      <img src="${u}" style="width:100%;height:90px;object-fit:cover;display:block">
      <button class="btn" data-rm="${encodeURIComponent(u)}" style="position:absolute;top:6px;right:6px;padding:4px 8px">×</button>
    </div>`).join('');
  }
  imagesEl.addEventListener('input', ()=>{ imagesEl.value = normalizeImagesInput(imagesEl.value).join('\n'); renderPreview(); });

  async function publishCars(arr){
    if(!arr.length){ alert('Сначала добавьте авто.'); return; }
    const resp = await fetch('/.netlify/functions/save-cars', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ cars: arr })
    });
    const data = await resp.json().catch(()=>({}));
    if(resp.ok){
      $('#publish_status').innerHTML = `Опубликовано: <a href="${data.url||'#'}" target="_blank">cars.json</a> <small>(items: ${arr.length})</small>`;
    }else{
      alert('Ошибка публикации: '+ (data.error || resp.status));
    }
  }

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const car=collect(); let arr=load();
    const i=arr.findIndex(x=>x.id===car.id); if(i>=0) arr[i]=car; else arr.push(car);
    save(arr); render(arr); await publishCars(arr);
  });
  document.addEventListener('click', e=>{
    const ed=e.target.closest('[data-edit]'); if(ed){ const id=ed.getAttribute('data-edit'); const c=load().find(x=>x.id===id); if(c) fill(c); }
    const rm=e.target.closest('[data-rm]'); if(rm){ e.preventDefault(); const u=decodeURIComponent(rm.getAttribute('data-rm'));
      imagesEl.value=(imagesEl.value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean).filter(x=>x!==u).join('\n'); renderPreview();
    }
    const del=e.target.closest('[data-del]'); if(del){ const id=del.getAttribute('data-del'); let arr=load().filter(x=>x.id!==id); save(arr); render(arr); publishCars(arr); }
    if(e.target.id==='car-add'){ form.reset(); imagesEl.value=''; renderPreview(); }
  });

  // Upload images
  const pickBtn = document.getElementById('btn-pick');
  const uploadBtn = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');
  const uploadMsg = document.getElementById('upload-msg');
  pickBtn?.addEventListener('click', ()=> fileInput && fileInput.click());
  async function toBase64(file){ return await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result)); r.onerror=rej; r.readAsDataURL(file); }); }
  async function uploadSelected(){
    try{
      if(!fileInput || !fileInput.files || fileInput.files.length===0){ alert('Сначала выберите фото'); return; }
      uploadBtn.disabled = true; pickBtn.disabled = true; uploadMsg.textContent = 'Загрузка...';
      const payload=[]; for(const f of fileInput.files){ payload.push({ name:f.name, dataUrl: await toBase64(f) }); }
      const resp = await fetch('/.netlify/functions/upload-image', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ files: payload }) });
      const data = await resp.json().catch(()=>({}));
      if(!resp.ok){ alert('Ошибка загрузки: ' + (data.error || resp.status)); }
      else { const urls=(data.urls||[]).filter(Boolean); if(urls.length){ const cur=(imagesEl.value||'').trim(); imagesEl.value = normalizeImagesInput((cur?cur+'\n':'') + urls.join('\n')).join('\n'); renderPreview(); } }
    }catch(e){ alert('Сбой загрузки: '+e); }
    finally{ uploadBtn.disabled=false; pickBtn.disabled=false; uploadMsg.textContent=''; if(fileInput) fileInput.value=''; }
  }
  uploadBtn?.addEventListener('click', uploadSelected);

  render(load()); renderPreview();

  // ------ Settings editor ------
  const sForm = document.getElementById('settings-form');
  if (sForm){
    fetch('/data/settings.json', { cache:'no-store' })
      .then(r=>r.json()).then(s=>{
        const set=(n,v)=>{ const el=sForm.querySelector('[name="'+n+'"]'); if(el) el.value=v||''; };
        set('brand', s.brand);
        set('slogan_ro', s.slogan?.ro); set('slogan_ru', s.slogan?.ru); set('slogan_en', s.slogan?.en);
        set('phone_main', s.phones?.main); set('phone_alt', s.phones?.alt);
        set('instagram_link', s.messengers?.instagram_link);
        set('whatsapp_link', s.messengers?.whatsapp_link);
        set('telegram_link', s.messengers?.telegram_link);
        set('viber_link', s.messengers?.viber_link);
        set('email', s.email); set('address', s.address);
      }).catch(()=>{});

    sForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const get=n=> sForm.querySelector('[name="'+n+'"]')?.value.trim() || '';
      const settings={
        brand:get('brand'),
        slogan:{ ro:get('slogan_ro'), ru:get('slogan_ru'), en:get('slogan_en') },
        phones:{ main:get('phone_main'), alt:get('phone_alt') },
        messengers:{
          instagram_link:get('instagram_link'),
          whatsapp_link:get('whatsapp_link'),
          telegram_link:get('telegram_link'),
          viber_link:get('viber_link')
        },
        email:get('email'),
        address:get('address')
      };
      const resp = await fetch('/.netlify/functions/save-settings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(settings) });
      const data = await resp.json().catch(()=>({}));
      const el = document.getElementById('settings-status');
      if(resp.ok){ el.textContent = 'Опубликовано: data/settings.json'; }
      else { alert('Ошибка сохранения настроек: ' + (data.error||resp.status)); }
    });
  }

  // ------- Notifications settings -------
  const nForm = document.getElementById('notify-form');
  if(nForm){
    fetch('/data/settings.json',{cache:'no-store'}).then(r=>r.json()).then(s=>{
      nForm.querySelector('[name="email_enabled"]').checked = !!(s.notifications && s.notifications.email_enabled!==false);
      nForm.querySelector('[name="email_to"]').value = (s.notifications && s.notifications.email_to) || 'paulacerniciuc@gmail.com';
    }).catch(()=>{});

    nForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const payload = { notifications: { email_enabled: nForm.querySelector('[name="email_enabled"]').checked, email_to: nForm.querySelector('[name="email_to"]').value.trim() } };
      const resp = await fetch('/.netlify/functions/save-settings-part', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await resp.json().catch(()=>({}));
      const el = document.getElementById('notify-status');
      if(resp.ok){ el.textContent='Сохранено'; } else { alert('Ошибка: '+(data.error||resp.status)); }
    });
  }

  // ------- CRM -------
  const crmForm = document.getElementById('crm-form');
  const crmList = document.getElementById('crm-list');
  function renderCRM(items){
    if(!crmList) return;
    crmList.innerHTML = (items||[]).map(i=>`<tr>
      <td>${i.name||''}</td><td>${i.phone||''}</td><td>${i.email||''}</td>
      <td>${i.car||''}</td><td>${i.date_from||''} → ${i.date_to||''}</td><td>${(i.comment||'').replace(/</g,'&lt;')}</td>
    </tr>`).join('');
  }
  async function loadCRM(){
    try{ const r=await fetch('/data/clients.json',{cache:'no-store'}); const j=await r.json(); renderCRM(j.clients||[]); }catch(e){}
  }
  if(crmForm){
    loadCRM();
    crmForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const get=n=> crmForm.querySelector('[name="'+n+'"]')?.value.trim() || '';
      const payload={ name:get('name'), phone:get('phone'), email:get('email'), car:get('car'), date_from:get('date_from'), date_to:get('date_to'), comment:get('comment') };
      const resp = await fetch('/.netlify/functions/save-client', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await resp.json().catch(()=>({}));
      const s=document.getElementById('crm-status');
      if(resp.ok){ s.textContent='Сохранено и отправлено'; loadCRM(); }
      else { alert('Ошибка CRM: '+(data.error||resp.status)); }
    });
  }

  // ------- Bookings -------
  const bkCar = document.getElementById('bk-car');
  const bkFrom = document.getElementById('bk-from');
  const bkTo = document.getElementById('bk-to');
  const bkAdd = document.getElementById('bk-add');
  const bkStatus = document.getElementById('bk-status');
  const calendarEl = document.getElementById('calendar');

  function dateStr(d){ return new Date(d).toISOString().slice(0,10); }
  async function loadBookings(){
    try{ const r=await fetch('/data/bookings.json',{cache:'no-store'}); const j=await r.json(); drawCalendar(j.bookings||[]); }catch(e){}
  }
  function rangeArray(from,to){ const out=[]; let d=new Date(from); const end=new Date(to); while(d<=end){ out.push(dateStr(d)); d.setDate(d.getDate()+1); } return out; }
  function drawCalendar(bookings){
    if(!calendarEl) return;
    const today=new Date(); const month=today.getMonth(); const year=today.getFullYear();
    const months=[0,1]; let html='';
    months.forEach(moff=>{
      const first=new Date(year, month+moff, 1);
      const last=new Date(year, month+moff+1, 0);
      const title=first.toLocaleString('ru-RU',{month:'long',year:'numeric'});
      html+=`<div class="card"><h4 style="margin:0 0 8px 0">${title}</h4><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">`;
      const bookedSet=new Set();
      bookings.forEach(b=> rangeArray(b.date_from,b.date_to).forEach(d=>bookedSet.add(d)) );
      const pad=(first.getDay()+6)%7; for(let i=0;i<pad;i++) html+='<div></div>';
      for(let day=1; day<=last.getDate(); day++){
        const d=new Date(year, month+moff, day);
        const ds=dateStr(d);
        const booked=bookedSet.has(ds);
        html+=`<div style="padding:10px;border-radius:8px;text-align:center;border:1px solid rgba(255,255,255,.12);${booked?'opacity:.4;background:#0a152c;':'background:rgba(0,229,255,.07);'}">${day}</div>`;
      }
      html+='</div></div>';
    });
    calendarEl.innerHTML=html;
  }
  if(bkAdd){
    bkAdd.addEventListener('click', async ()=>{
      if(!bkCar.value || !bkFrom.value || !bkTo.value){ alert('Укажи авто и период'); return; }
      const payload={ car: bkCar.value.trim(), date_from: bkFrom.value, date_to: bkTo.value };
      const resp = await fetch('/.netlify/functions/save-booking', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await resp.json().catch(()=>({}));
      if(resp.ok){ bkStatus.textContent='Занятость добавлена'; loadBookings(); }
      else alert('Ошибка брони: '+(data.error||resp.status));
    });
    loadBookings();
  }
})();
  // ------- CRM Export CSV -------
  function toCSV(rows){
    const esc = v => `"${String(v||'').replace(/"/g,'""')}"`;
    const header = ['name','phone','email','car','date_from','date_to','comment','created_at'];
    const lines = [header.join(',')];
    rows.forEach(i=> lines.push(header.map(k=>esc(i[k])).join(',')) );
    return lines.join('\n');
  }
  async function exportCsv(){
    try{
      const r=await fetch('/data/clients.json',{cache:'no-store'});
      const j=await r.json(); const rows=j.clients||[];
      const blob = new Blob([toCSV(rows)], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href=url; a.download='clients.csv'; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }catch(e){ alert('Не удалось экспортировать CSV'); }
  }
  const crmToolbar = document.querySelector('#tab-crm .card h3');
  if(crmToolbar){
    const btn = document.createElement('button');
    btn.className='btn'; btn.textContent='Экспорт CSV';
    btn.style.marginLeft='10px'; btn.addEventListener('click', exportCsv);
    crmToolbar.after(btn);
  }

  // ------- Drag & Drop images -------
  function wireDnD(){
    const box = document.getElementById('images-preview');
    if(!box) return;
    Array.from(box.children).forEach((item, idx)=>{
      item.setAttribute('draggable','true');
      item.dataset.dragIndex = idx;
      item.addEventListener('dragstart', e=>{
        e.dataTransfer.setData('text/plain', String(idx));
      });
      item.addEventListener('dragover', e=> e.preventDefault());
      item.addEventListener('drop', e=>{
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        const to = Number(item.dataset.dragIndex);
        const urls = (document.getElementById('car-images').value||'').split(/\n+/).map(s=>s.trim()).filter(Boolean);
        if(from===to || from>=urls.length || to>=urls.length) return;
        const moved = urls.splice(from,1)[0];
        urls.splice(to,0,moved);
        document.getElementById('car-images').value = urls.join('\n');
        renderPreview();
        wireDnD(); // rebind
      });
    });
  }
  const _oldRenderPreview = renderPreview;
  renderPreview = function(){ _oldRenderPreview(); wireDnD(); };

  // ------- Simple phone mask (+373 ...) -------
  function formatPhone(v){ 
    v = v.replace(/[^\d+]/g,'');
    if(!v.startsWith('+')) v = '+'+v;
    return v.replace(/(\+\d{3})(\d{0,3})(\d{0,2})(\d{0,2})(\d{0,2}).*/, (m,a,b,c,d,e)=>[a,b&&' '+b,c&&' '+c,d&&' '+d,e&&' '+e].filter(Boolean).join(''));
  }
  ['phone','phone_main','phone_alt'].forEach(name=>{
    document.querySelectorAll(`[name="${name}"]`).forEach(el=>{
      el.addEventListener('input', ()=> el.value = formatPhone(el.value));
    });
  });

  // ------- Basic i18n for admin labels -------
  const i18n = {
    ru: { cars:'Автомобили', crm:'CRM', booking:'Календарь', settings:'Настройки', notify:'Уведомления', save:'Сохранить' },
    ro: { cars:'Automobile', crm:'CRM', booking:'Calendar', settings:'Setări', notify:'Notificări', save:'Salvează' },
    en: { cars:'Cars', crm:'CRM', booking:'Calendar', settings:'Settings', notify:'Notifications', save:'Save' }
  };
  function applyLang(lang){
    const t=i18n[lang]||i18n.ru;
    document.querySelectorAll('.tab-btn[data-tab="cars"]').forEach(b=>b.textContent=t.cars);
    document.querySelectorAll('.tab-btn[data-tab="crm"]').forEach(b=>b.textContent=t.crm);
    document.querySelectorAll('.tab-btn[data-tab="booking"]').forEach(b=>b.textContent=t.booking);
    document.querySelectorAll('.tab-btn[data-tab="settings"]').forEach(b=>b.textContent=t.settings);
    document.querySelectorAll('.tab-btn[data-tab="notify"]').forEach(b=>b.textContent=t.notify);
    document.querySelectorAll('#car-save').forEach(b=>b.textContent=t.save);
  }
  document.querySelectorAll('#lang-switch [data-lang]').forEach(btn=>{
    btn.addEventListener('click', ()=>{ applyLang(btn.dataset.lang); });
  });
  applyLang('ru');


// auto-upload on file choose
try{
  const fileInput = document.getElementById('file-input');
  const pickBtn = document.getElementById('btn-pick');
  if(pickBtn && fileInput){
    pickBtn.addEventListener('click', ()=> fileInput.click());
    fileInput.addEventListener('change', ()=>{
      if(fileInput.files && fileInput.files.length){
        if(typeof uploadSelected==='function'){ uploadSelected(); }
      }
    });
  }
}catch(e){ /* ignore */ }
