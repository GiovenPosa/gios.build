// The Gio UI waitlist on gios.build/ui:
//
//   POST /api/waitlist   { email, website, source_page }
//
// Saves the email to ui_waitlist (supabase/migrations), once per address.
// It answers the same whether the address is new or already on the list, so
// the form can't be used to check who has signed up. Rate-limited per IP with
// the enquiry form's limiter.

import { EMAIL_PATTERN } from '../src/data/enquiry';
import { db, type EnquiryEnv } from './enquiry';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fail = (status: number, error: string) => json({ error }, status);

/** Handles /api/waitlist; returns null for any other path. */
export async function waitlist(request: Request, env: EnquiryEnv, pathname: string): Promise<Response | null> {
  if (pathname !== '/api/waitlist') return null;
  if (request.method !== 'POST') return fail(405, 'Not allowed.');

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.ENQUIRY_LIMIT.limit({ key: ip });
  if (!success) return fail(429, "That's a lot of requests at once. Please wait a minute and try again.");

  let body: Record<string, unknown>;
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return fail(400, 'Something went wrong. Please try again.');
  }

  // the hidden "website" field: people never see it, bots fill it in.
  // Answer as if it worked and save nothing.
  if (body.website) return json({ ok: true });

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) return fail(400, 'Please enter a valid email.');
  const source = typeof body.source_page === 'string' && body.source_page.startsWith('/') ? body.source_page.slice(0, 200) : null;

  try {
    await db(env, 'ui_waitlist?on_conflict=email', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email, source_page: source }),
    });
  } catch {
    return fail(500, 'Something went wrong on my side. Please try again, or email contact@gios.build.');
  }
  return json({ ok: true });
}
