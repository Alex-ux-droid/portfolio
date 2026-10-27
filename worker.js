// Cloudflare Worker: статичні файли з assets, службові файли з правильним Content-Type.
const TYPES = {
  '/sitemap.xml': 'application/xml; charset=utf-8',
  '/robots.txt': 'text/plain; charset=utf-8',
  '/llms.txt': 'text/plain; charset=utf-8',
  '/llms-full.txt': 'text/plain; charset=utf-8',
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const res = await env.ASSETS.fetch(request);
    const type = TYPES[url.pathname];
    if (!type || !res.ok) return res;
    const h = new Headers(res.headers);
    h.set('Content-Type', type);
    h.set('Cache-Control', 'public, max-age=3600');
    return new Response(res.body, { status: res.status, headers: h });
  },
};
