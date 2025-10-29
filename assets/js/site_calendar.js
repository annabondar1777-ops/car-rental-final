
// Enhanced site calendar: supports global #site-calendar and per-car widgets .car-calendar[data-car]
(function(){
  async function fetchBookings(){
    try{
      const r = await fetch('/data/bookings.json',{cache:'no-store'});
      return await r.json();
    }catch(e){ return { bookings:[] }; }
  }
  function daysRange(from,to){
    const out=[]; let d=new Date(from); const end=new Date(to);
    while(d<=end){ out.push(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1); }
    return out;
  }
  function drawCalendar(target, bookings, filterCar=null){
    const today=new Date(); const month=today.getMonth(); const year=today.getFullYear();
    const months=[0,1]; // current + next
    let html='';
    // Build booked set optionally by car
    const bookedSet=new Set();
    (bookings||[]).forEach(b=>{
      if(filterCar && (String(b.car||'').toLowerCase() !== String(filterCar).toLowerCase())) return;
      daysRange(b.date_from,b.date_to).forEach(d=>bookedSet.add(d));
    });
    months.forEach(moff=>{
      const first=new Date(year, month+moff, 1);
      const last=new Date(year, month+moff+1, 0);
      const title=first.toLocaleString('ru-RU',{month:'long',year:'numeric'});
      html+=`<div class="card"><h4 style="margin:0 0 8px 0">${title}</h4><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px">`;
      const pad=(first.getDay()+6)%7; for(let i=0;i<pad;i++) html+='<div></div>';
      for(let day=1;day<=last.getDate();day++){
        const d=new Date(year, month+moff, day);
        const ds=d.toISOString().slice(0,10);
        const booked=bookedSet.has(ds);
        html+=`<div style="padding:10px;border-radius:8px;text-align:center;border:1px solid rgba(255,255,255,.12);${booked?'opacity:.4;background:#0a152c;':'background:rgba(0,229,255,.07);'}">${day}</div>`;
      }
      html+='</div></div>';
    });
    target.innerHTML=html;
  }
  async function run(){
    const data = await fetchBookings();
    const global = document.getElementById('site-calendar');
    if(global) drawCalendar(global, data.bookings||[]);
    document.querySelectorAll('.car-calendar[data-car]').forEach(el=>{
      const car = el.getAttribute('data-car')||'';
      drawCalendar(el, data.bookings||[], car);
    });
  }
  document.addEventListener('DOMContentLoaded', run);
})();
