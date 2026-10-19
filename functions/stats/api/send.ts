// Cloudflare Pages Function: passes the tracker's page views and events on
// to Umami Cloud. The visitor's IP and browser go along so Umami can tell
// the country and device; Umami doesn't store the IP itself.
export const onRequestPost = async ({ request }: { request: Request }) => {
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const upstream = await fetch('https://cloud.umami.is/api/send', {
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
};
