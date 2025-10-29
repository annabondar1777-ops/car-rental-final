
import { getFile, putFile, notifyWhatsApp, sendEmail } from '../_helpers.mjs';
export const handler = async (event) => {
  try{
    if(event.httpMethod!=='POST') return { statusCode:405, body:'Method Not Allowed' };
    const payload = JSON.parse(event.body||'{}');
    const token  = process.env.GITHUB_TOKEN; const repo = process.env.REPO_FULL; const branch = process.env.BRANCH || 'main';
    if(!token||!repo) return { statusCode:500, body: JSON.stringify({error:'Missing env: GITHUB_TOKEN or REPO_FULL'}) };
    const api='https://api.github.com'; const path='data/clients.json';
    const getUrl = `${api}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    let sha, obj={clients:[]};
    const getRes = await fetch(getUrl, { headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func' } });
    if(getRes.ok){ const j=await getRes.json(); sha=j.sha; try{ obj = JSON.parse(Buffer.from(j.content||'', 'base64').toString('utf-8')); }catch(e){} }
    payload.created_at = new Date().toISOString(); obj.clients = obj.clients||[]; obj.clients.push(payload);
    const content = Buffer.from(JSON.stringify(obj, null, 2)).toString('base64');
    const putRes = await fetch(`${api}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
      method:'PUT', headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func', 'Content-Type':'application/json' },
      body: JSON.stringify({ message:'Add client via Netlify', content, branch, sha })
    });
    const out = await putRes.json(); if(!putRes.ok) return { statusCode: putRes.status, body: JSON.stringify({error: out}) };
    const msg = `Новая заявка: ${payload.name||''} ${payload.phone||''} авто: ${payload.car||'-'} период: ${payload.date_from||''}→${payload.date_to||''}`;
    await notifyWhatsApp(msg, process.env);
    await sendEmail('Новая заявка на сайте', msg + `
Зайдите в админку: ${process.env.SITE_URL||''}/admin/cars.html`, process.env);
    return { statusCode:200, body: JSON.stringify({ok:true}) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({error:String(e)}) }; }
};