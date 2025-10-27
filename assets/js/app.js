
function goFleet(){ location.href='fleet.html'; }


// v14: Callback modal with WhatsApp default & clipboard fallback
(function(){
  const modal = document.getElementById('cb-modal');
  if(!modal) return;
  const PHONE = "+37360922323";
  // openers: any button with data-i18n="request_call"
  function open(){ modal.hidden=false; document.body.style.overflow='hidden'; }
  function close(){ modal.hidden=true; document.body.style.overflow=''; }
  document.querySelectorAll('[data-i18n="request_call"]').forEach(b=> b.addEventListener('click', open));
  modal.querySelector('.cb-x').addEventListener('click', close);
  modal.querySelector('#cb-cancel').addEventListener('click', close);
  modal.addEventListener('click', e=>{ if(e.target===modal) close(); });
  modal.querySelector('#cb-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const f = new FormData(e.target);
    const name=(f.get('name')||'').trim();
    const phone=(f.get('phone')||'').trim();
    const note=(f.get('note')||'').trim();
    const msg = encodeURIComponent(`Заявка на звонок:\nИмя: ${name}\nТелефон: ${phone}\nКомментарий: ${note}`);
    const wa = `https://wa.me/${PHONE.replace(/[^\d]/g,'')}?text=${msg}`;
    try{
      window.open(wa, '_blank');
    }catch(_){}
    try{
      await navigator.clipboard.writeText(`Имя: ${name}\nТелефон: ${phone}\nКомментарий: ${note}`);
    }catch(_){}
    close();
  });
})();



// v16: safer modal open/close (no freeze), ESC to close
(function(){
  var modal = document.getElementById('cb-modal');
  if(!modal) return;
  var PHONE = "+37360922323";
  function open(){ if(modal.hasAttribute('hidden')){ modal.removeAttribute('hidden'); } document.body.style.overflow='hidden'; }
  function close(){ modal.setAttribute('hidden',''); document.body.style.overflow=''; }
  // Bind only to openers outside the modal
  document.querySelectorAll('[data-i18n="request_call"]').forEach(function(b){
    if(!modal.contains(b)){ b.addEventListener('click', open); }
  });
  var cbx = modal.querySelector('.cb-x'); if(cbx) cbx.addEventListener('click', close);
  var cbc = modal.querySelector('#cb-cancel'); if(cbc) cbc.addEventListener('click', close);
  modal.addEventListener('click', function(e){ if(e.target === modal) close(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ close(); }});
  var form = modal.querySelector('#cb-form');
  if(form){
    form.addEventListener('submit', async function(e){
      e.preventDefault();
      var f = new FormData(form);
      var name=(f.get('name')||'').trim();
      var phone=(f.get('phone')||'').trim();
      var note=(f.get('note')||'').trim();
      var msg = encodeURIComponent('Заявка на звонок:\\nИмя: '+name+'\\nТелефон: '+phone+'\\nКомментарий: '+note);
      var wa = 'https://wa.me/'+PHONE.replace(/[^\\d]/g,'')+'?text='+msg;
      try{ window.open(wa, '_blank'); }catch(_){}
      try{ await navigator.clipboard.writeText('Имя: '+name+'\\nТелефон: '+phone+'\\nКомментарий: '+note); }catch(_){}
      close();
    });
  }
})();

