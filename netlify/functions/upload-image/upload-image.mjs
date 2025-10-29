
const fetch = globalThis.fetch;

function nowFolder(){ const d=new Date(); return `${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}`; }
export const handler = async (event) => {
  try{
    if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body||'{}'); const files = body.files || [];
    const token  = process.env.GITHUB_TOKEN; const repo = process.env.REPO_FULL; const branch = process.env.BRANCH || 'main';
    if(!token||!repo) return { statusCode:500, body: JSON.stringify({ error: 'Missing env: GITHUB_TOKEN or REPO_FULL' }) };
    const api='https://api.github.com'; const folder = `assets/cars/${nowFolder()}`; const urls=[];
    for(const f of files){
      const name = String(f.name||'image.jpg').replace(/[^a-zA-Z0-9._-]/g,'_');
      const b64 = String(f.dataUrl||'').split(',').pop(); const path = `${folder}/${Date.now()}_${name}`;
      const putRes = await fetch(`${api}/repos/${repo}/contents/${encodeURIComponent(path)}`, {
        method:'PUT', headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func', 'Content-Type':'application/json' },
        body: JSON.stringify({ message:`Upload ${name} via Netlify`, content:b64, branch })
      });
      const out = await putRes.json(); if(!putRes.ok) return { statusCode: putRes.status, body: JSON.stringify({ error: out }) };
      urls.push(out.content?.download_url || null);
    }
    return { statusCode:200, body: JSON.stringify({ ok:true, urls }) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({ error: String(e) }) }; }
};
