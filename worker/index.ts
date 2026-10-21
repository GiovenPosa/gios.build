// Runs in front of /stats and /api only (see wrangler.jsonc); everything else
// is served straight from the built site.
//
// Umami's tracker and its page views and events go through this site's own
// /stats path rather than Umami's domain, so ad blockers that block
// analytics domains leave them alone (see src/lib/analytics.ts).
//
// /api/enquiry is the enquiry form's endpoint (worker/enquiry.ts).

import { enquiry, type EnquiryEnv } from './enquiry';

interface Env extends EnquiryEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const UMAMI = 'https://cloud.umami.is';

async function tracker(request: Request): Promise<Response> {
  const upstream = await fetch(`${UMAMI}/script.js`, {
    headers: { 'User-Agent': request.headers.get('User-Agent') ?? '' },
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// The visitor's IP and browser go along so Umami can tell the country and
// device; Umami doesn't store the IP itself.
async function send(request: Request): Promise<Response> {
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const upstream = await fetch(`${UMAMI}/api/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('User-Agent') ?? '',
      'X-Forwarded-For': ip,
      'X-Client-IP': ip,
    },
    body: await request.text(),
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('Content-Type') ?? 'application/json' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/stats/s.js' && request.method === 'GET') return tracker(request);
    if (pathname === '/stats/api/send' && request.method === 'POST') return send(request);
    if (pathname.startsWith('/api/')) {
      return (await enquiry(request, env, pathname)) ?? new Response('Not found', { status: 404 });
    }
    return env.ASSETS.fetch(request);
  },
};
