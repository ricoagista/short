function randKey(n=7){
  const s='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({length:n},()=>s[Math.floor(Math.random()*s.length)]).join('');
}
function isValidKey(k){ return /^[A-Za-z0-9_-]{1,48}$/.test(k||'') }
function isValidUrl(u){ try{ const x=new URL(u); return ['http:','https:'].includes(x.protocol) }catch{ return false } }

export async function onRequestPost({ request, env }) {
  const { url: longUrl, key } = await request.json().catch(()=>({}));
  if (!isValidUrl(longUrl)) {
    return new Response(JSON.stringify({ ok:false, error:'URL tidak valid' }), {
      status:400, headers:{'Content-Type':'application/json'}
    });
  }
  let k = key && isValidKey(key) ? key : randKey(7);
  const existed = await env.LINKS.get(k);
  if (existed && key) {
    return new Response(JSON.stringify({ ok:false, error:'Alias sudah dipakai' }), {
      status:409, headers:{'Content-Type':'application/json'}
    });
  }
  if (existed && !key) k = randKey(8);

  await env.LINKS.put(k, longUrl);
  const host = new URL(request.url).host;
  return new Response(JSON.stringify({ ok:true, key:k, url:longUrl, short:`https://${host}/${k}` }), {
    headers:{'Content-Type':'application/json','Cache-Control':'no-store'}
  });
}
