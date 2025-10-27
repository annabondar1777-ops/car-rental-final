
import fetch from 'node-fetch';

async function getFile(api, repo, path, branch, token){
  const url = `${api}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
  const r = await fetch(url, { headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func' }});
  if(!r.ok) return { sha: undefined, json: {} };
  const j = await r.json();
  const content = Buffer.from(j.content || '', 'base64').toString('utf-8');
  try{ return { sha: j.sha, json: JSON.parse(content) }; }catch(e){ return { sha: j.sha, json: {} }; }
}
async function putFile(api, repo, path, branch, token, sha, obj, message){
  const content = Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
  const url = `${api}/repos/${repo}/contents/${encodeURIComponent(path)}`;
  const r = await fetch(url, {
    method:'PUT',
    headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func', 'Content-Type':'application/json' },
    body: JSON.stringify({ message, content, branch, sha })
  });
  const out = await r.json();
  if(!r.ok) throw out;
  return out;
}
async function notifyWhatsApp(){ return { ok:false, skipped:true }; }

async function sendEmail(subject, text, env){
  const to = (env.EMAIL_TO||'').trim(); const from = (env.EMAIL_FROM||'notify@yourdomain.local').trim();
  if(!to) return { ok:false, skipped:true, reason:'no EMAIL_TO' };
  if(env.SENDGRID_API_KEY){
    const url='https://api.sendgrid.com/v3/mail/send';
    const payload = { personalizations:[{ to:[{email:to}] }], from:{ email: from }, subject, content:[{ type:'text/plain', value:text }] };
    const r = await fetch(url, { method:'POST', headers:{ Authorization:`Bearer ${env.SENDGRID_API_KEY}`, 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    const txt = await r.text(); return { ok:r.status===202, resp:txt };
  }
  if(env.MAILGUN_API_KEY && env.MAILGUN_DOMAIN){
    const url = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;
    const form = new URLSearchParams(); form.append('from', from); form.append('to', to); form.append('subject', subject); form.append('text', text);
    const r = await fetch(url, { method:'POST', headers:{ Authorization: 'Basic '+Buffer.from('api:'+env.MAILGUN_API_KEY).toString('base64') }, body: form });
    const j = await r.json().catch(()=>({})); return { ok:r.ok, resp:j };
  }
  return { ok:false, skipped:true, reason:'no provider' };
}

export { getFile, putFile, notifyWhatsApp, sendEmail };
