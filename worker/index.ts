// Runs in front of every request (see wrangler.jsonc): it sends other
// addresses for the site to https://www.gios.build, answers /stats and /api,
// and serves everything else from the built site, with a 404 status for
// paths that aren't pages.
//
// Umami's tracker and its page views and events go through this site's own
// /stats path rather than Umami's domain, so ad blockers that block
// analytics domains leave them alone (see src/lib/analytics.ts).
//
// /api/enquiry is the enquiry form's endpoint (worker/enquiry.ts),
// /api/waitlist the Gio UI waitlist on /ui (worker/waitlist.ts), and
// /api/audit the free website audit's form (worker/audit.ts).

import { enquiry, type EnquiryEnv } from './enquiry';
import { waitlist } from './waitlist';
import { audit, type AuditEnv } from './audit';

// the audit's background run; exported so Cloudflare can find it (wrangler.jsonc)
export { AuditWorkflow } from './auditWorkflow';
import { PAGES as SEO_PAGES } from '../src/data/seo';

interface Env extends EnquiryEnv, AuditEnv {
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

// The one address Google should know the site by. gios.build, and plain
// http, both answer with a permanent redirect to it, so search engines never
// see two copies of a page.
const HOST = 'www.gios.build';

// The app's real pages (src/data/seo.ts, the same list the router and the
// sitemap use). Any other path still gets the app, which shows its
// not-found page, but with a 404 status, so search engines don't index it
// as a page of its own.
const PAGES = new Set(Object.keys(SEO_PAGES));

// Old pages folded into the home page: moved for good.
const MOVED: Record<string, string> = {
  '/about': '/#story',
  '/contact': '/#contact',
};

async function site(request: Request, env: Env, url: URL): Promise<Response> {
  const moved = MOVED[url.pathname];
  if (moved) return Response.redirect(`https://${HOST}${moved}`, 301);
  const response = await env.ASSETS.fetch(request);
  // a path with no file comes back as the app's index.html with a 200
  const isPage = (response.headers.get('Content-Type') ?? '').startsWith('text/html');
  if (response.status === 200 && isPage && !PAGES.has(url.pathname)) {
    return new Response(response.body, { status: 404, headers: response.headers });
  }
  return response;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    // local runs (wrangler dev) are on localhost: left as they are
    const live = url.hostname.endsWith('gios.build');
    if (live && (url.hostname !== HOST || url.protocol !== 'https:')) {
      url.hostname = HOST;
      url.protocol = 'https:';
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    const { pathname } = url;
    if (pathname === '/stats/s.js' && request.method === 'GET') return tracker(request);
    if (pathname === '/stats/api/send' && request.method === 'POST') return send(request);
    if (pathname.startsWith('/api/')) {
      return (
        (await waitlist(request, env, pathname)) ??
        (await audit(request, env, pathname)) ??
        (await enquiry(request, env, pathname)) ??
        new Response('Not found', { status: 404 })
      );
    }
    return site(request, env, url);
  },
};
