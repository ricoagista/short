// functions/s/[alias].js
// Menangani redirect: GET /s/<alias>
export async function onRequest({ params, env }) {
  const { alias } = params;       // contoh: /s/google -> alias = "google"
  if (!alias) return new Response('Not found', { status: 404 });

  // Lookup KV: LINKS[alias] -> target URL
  const target = await env.LINKS.get(alias);
  if (target) return Response.redirect(target, 301);

  return new Response('Shortlink tidak ditemukan', { status: 404 });
}
