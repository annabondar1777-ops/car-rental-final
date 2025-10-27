
(function(){
  async function run(){
    try{
      const r = await fetch('/data/settings.json', { cache:'no-store' });
      if(!r.ok) return;
      const s = await r.json();
      const setHref=(sel,val)=>document.querySelectorAll(sel).forEach(el=>{ if(val){ el.setAttribute('href', val); el.style.display=''; } else { el.style.display='none'; } });
      setHref('a.instagram, .social-instagram', s.messengers?.instagram_link||'');
      setHref('a.whatsapp, .social-whatsapp', s.messengers?.whatsapp_link||'');
      setHref('a.telegram, .social-telegram', s.messengers?.telegram_link||'');
      setHref('a.viber, .social-viber', s.messengers?.viber_link||'');
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', run);
})();