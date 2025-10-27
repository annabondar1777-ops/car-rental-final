
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo img, .logo, .site-logo img, img[alt*="logo"]');
    if(!logo) return;
    let clicks=0;
    logo.addEventListener('click', ()=>{
      clicks++; setTimeout(()=>clicks=0,500);
      if(clicks===2) openHiddenLogin();
    });
    function openHiddenLogin(){
      const o=document.createElement('div');
      o.style='position:fixed;inset:0;background:rgba(0,0,0,.92);display:flex;justify-content:center;align-items:center;z-index:99999;';
      o.innerHTML='<form><input type="password" id="secret-pass" placeholder="" autocomplete="off" style="background:transparent;border:none;border-bottom:1px solid rgba(0,229,255,.6);color:#eaf7ff;font-size:20px;outline:none;text-align:center;width:220px;"></form>';
      document.body.appendChild(o);
      const input=o.querySelector('#secret-pass'); input.focus();
      input.addEventListener('keydown', e=>{
        if(e.key==='Enter'){ e.preventDefault();
          if((input.value||'').trim()==='htcreator2025'){ o.remove(); window.open('/admin/cars.html','_blank'); }
          else { o.remove(); }
        }
      });
      o.addEventListener('click', e=>{ if(e.target===o) o.remove(); });
    }
  });
})();