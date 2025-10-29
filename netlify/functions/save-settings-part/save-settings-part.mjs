
import fetch from 'node-fetch';
export const handler = async (event) => {
  try{
    if(event.httpMethod!=='POST') return { statusCode:405, body:'Method Not Allowed' };
    const patch = JSON.parse(event.body||'{}');
    const token  = process.env.GITHUB_TOKEN; const repo = process.env.REPO_FULL; const branch = process.env.BRANCH || 'main';
    const path   = 'data/settings.json'; if(!token||!repo) return { statusCode:500, body: JSON.stringify({error:'Missing env: GITHUB_TOKEN or REPO FULL'}) };
    const api='https://api.github.com';
    const getUrl = `${api}/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    let sha, settings={};
    const getRes = await fetch(getUrl, { headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func' } });
    if(getRes.ok){ const j=await getRes.json(); sha=j.sha; settings = JSON.parse(Buffer.from(j.content||'', 'base64').toString('utf-8') || '{}'); }
    function deepMerge(t={}, s={}){ const out = Array.isArray(t)?[...t]:{...t}; for(const k of Object.keys(s)){ if(s[k] && typeof s[k]==='object' && !Array.isArray(s[k])) out[k]=deepMerge(out[k]||{}, s[k]); else out[k]=s[k]; } return out; }
    const merged = deepMerge(settings, patch);
    const content = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');
    const putRes = await fetch(`${api}/repos/${repo}/contents/${encodeURIComponent(path)}`,{
      method:'PUT', headers:{ Authorization:`token ${token}`, 'User-Agent':'netlify-func', 'Content-Type':'application/json' },
      body: JSON.stringify({ message:'Update settings via partial save', content, branch, sha })
    });
    const out = await putRes.json(); if(!putRes.ok) return { statusCode: putRes.status, body: JSON.stringify({error: out}) };
    return { statusCode:200, body: JSON.stringify({ok:true}) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({error:String(e)}) }; }
};