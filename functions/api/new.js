// functions/api/new.js
function randKey(n = 7) {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join('');
}
function isValidKey(k) { return /^[A-Za-z0-9_-]{1,48}$/.test(k || ''); }
function isValidUrl(u) { try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol) } catch { return false } }

export async function onRequestPost({ request, env }) {
  // Body JSON: { "url": "https://...", "key": "opsional" }
  const { url: longUrl, key } = await request.json().catch(() => ({}));

  // Validasi URL
  if (!isValidUrl(longUrl)) {
    return new Response(JSON.stringify({ ok: false, error: 'URL tidak valid' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Tentukan alias
  let k = key && isValidKey(key) ? key : randKey(7);

  // Cek tabrakan alias
  const existed = await env.LINKS.get(k);
  if (existed && key) {
    return new Response(JSON.stringify({ ok: false, error: 'Alias sudah dipakai' }), {
      status: 409, headers: { 'Content-Type': 'application/json' }
    });
  }
  if (existed && !key) k = randKey(8);

  // Simpan ke KV
  await env.LINKS.put(k, longUrl);

  // Bangun URL pendek dengan prefix /s/
  const host = new URL(request.url).host;
  return new Response(JSON.stringify({
    ok: true,
    key: k,
    url: longUrl,
    short: `https://${host}/s/${k}`
  }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
