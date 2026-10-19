// Cloudflare Pages Function: serves Umami's tracker from this site's own
// /stats path, so ad blockers that block analytics domains leave it alone
// (see src/lib/analytics.ts).
export const onRequestGet = async ({ request }: { request: Request }) => {
  const upstream = await fetch('https://cloud.umami.is/script.js', {
    headers: { 'User-Agent': request.headers.get('User-Agent') ?? '' },
    cf: { cacheTtl: 3600, cacheEverything: true },
  } as RequestInit);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
