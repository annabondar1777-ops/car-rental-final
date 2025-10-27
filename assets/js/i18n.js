
// i18n + safe setLang (v12b)
(function(){
  const dict = {
    ro:{ brand:"Auto Rent Chișinău", slogan:"Încredere la fiecare kilometru.", fleet:"Parc auto", conditions:"Condiții", contact:"Contacte", park_btn:"Parcul nostru",
         whatsapp:"WhatsApp", telegram:"Telegram", viber:"Viber", instagram:"Instagram", call_now:"Sună", back:"Înapoi", request_call:"Solicită apel",
         contact_headline:"Contactați-ne 24/7" },
    ru:{ brand:"Auto Rent Chișinău", slogan:"Доверие в каждом километре", fleet:"Автопарк", conditions:"Условия", contact:"Контакты", park_btn:"Наш автопарк",
         whatsapp:"WhatsApp", telegram:"Telegram", viber:"Viber", instagram:"Instagram", call_now:"Позвонить", back:"Назад", request_call:"Заказать звонок",
         contact_headline:"Свяжитесь с нами 24/7" },
    en:{ brand:"Auto Rent Chișinău", slogan:"Trust at every kilometre.", fleet:"Fleet", conditions:"Conditions", contact:"Contact", park_btn:"Our fleet",
         whatsapp:"WhatsApp", telegram:"Telegram", viber:"Viber", instagram:"Instagram", call_now:"Call", back:"Back", request_call:"Request a call",
         contact_headline:"Contact us 24/7" }
  };
  function apply(lang){
    const t = dict[lang] || dict.ro;
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k=el.getAttribute("data-i18n"); if(!k) return;
      if(k.endsWith("_html")) el.innerHTML = t[k.replace("_html","")] || ""; else el.textContent = t[k] || "";
    });
    const kill = ["Подключим CRM — и здесь появятся авто","Скоро здесь появится авто","Скоро здесь появятся авто","Календарь подтянется после подключения CRM","Календарь появится после подключения"];
    document.querySelectorAll("p,div,span,section,footer").forEach(n=>{
      const tx=(n.textContent||"").trim(); if(!tx) return;
      if(kill.some(s=>tx.includes(s))) n.remove();
    });
  }
  const __setLang = window.setLang;
  window.setLang = function(lang){ try{ if(typeof __setLang==="function") __setLang(lang); }catch(e){}; localStorage.setItem("lang", lang); apply(lang); };
  document.addEventListener("DOMContentLoaded", ()=>{
    const lang = localStorage.getItem("lang") || "ro";
    apply(lang);
    document.querySelectorAll("[data-lang]").forEach(btn=> btn.addEventListener("click", ()=> setLang(btn.getAttribute("data-lang"))));
  });
})();