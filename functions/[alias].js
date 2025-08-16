export async function onRequest({ params, env }) {
  const { alias } = params;
  if (!alias || alias === 'api') return new Response(null, { status:404 });
  const target = await env.LINKS.get(alias);
  if (target) return Response.redirect(target, 301);
  return new Response('Shortlink tidak ditemukan', { status:404 });
}
