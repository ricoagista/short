export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (pathname === "/api/new" && req.method === "POST") {
      return new Response(JSON.stringify({ ok: true, msg: "Functions OK" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return env.ASSETS.fetch(req); // selain /api/new layani file di /public
  }
}
