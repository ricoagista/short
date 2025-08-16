// Cloudflare Pages _worker.js (Functions) — UI + API + Redirect
function randKey(n=7){
  const s='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length:n},()=>s[Math.floor(Math.random()*s.length)]).join('');
}
function isValidKey(k){ return /^[A-Za-z0-9_-]{1,48}$/.test(k||'') }
function isValidUrl(u){ try{ const x=new URL(u); return ['http:','https:'].includes(x.protocol) }catch{ return false } }

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API: buat shortlink
    if (url.pathname === '/api/new' && request.method === 'POST') {
      const { url: longUrl, key } = await request.json().catch(()=>({}));
      if (!isValidUrl(longUrl)) {
        return new Response(JSON.stringify({ ok:false, error:'URL tidak valid' }), { status:400, headers:{'Content-Type':'application/json'} });
      }
      let k = key && isValidKey(key) ? key : randKey(7);
      const existed = await env.LINKS.get(k);
      if (existed && key)  return new Response(JSON.stringify({ ok:false, error:'Alias sudah dipakai' }), { status:409, headers:{'Content-Type':'application/json'} });
      if (existed && !key) k = randKey(8);

      await env.LINKS.put(k, longUrl);
      return new Response(JSON.stringify({ ok:true, key:k, url:longUrl, short:`https://${url.host}/${k}` }), {
        headers:{'Content-Type':'application/json'}
      });
    }

    // Redirect: cek segmen pertama sebagai alias
    const path = url.pathname.replace(/^\/+/, '');
    const alias = path.split('/')[0];
    if (alias && alias !== 'api') {
      const target = await env.LINKS.get(alias);
      if (target) return Response.redirect(target, 301);
    }

    // Bukan API / alias → sajikan asset statis dari folder "public/"
    return env.ASSETS.fetch(request);
  }
}
