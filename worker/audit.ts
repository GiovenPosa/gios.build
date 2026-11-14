// The free website audit's endpoint (docs/website-audit/spec.md).
//
//   POST /api/audit   the /website-audit form: website, email, phone, the
//                     optional "what do you want more of?", the consent tick
//                     and the Turnstile token. Checks it all, saves the
//                     request to `audits`, and files it in booking_inquiries
//                     (source_page '/website-audit', linked to the visitor's
//                     contact), where the lead app's inbox and push alert
//                     pick it up.
//
// Phase 1 stops there: the audit is put together by hand. Later phases start
// the background Workflow from here (plan.md, phase 2).
//
// Each audit will cost real money once it's automatic, so requests are
// guarded: Turnstile, a per-minute limiter, three a day per visitor, one per
// website every 30 days, and a daily cap across the site (past it, requests
// are kept, marked 'held').

import { AUDIT_CONSENT, AUDIT_PATH } from '../src/data/audit';
import { EMAIL_PATTERN } from '../src/data/enquiry';
import { contactFor, db } from './enquiry';

export interface AuditEnv {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
  /** Cloudflare's rate limiter, per visitor IP, per minute (wrangler.jsonc) */
  AUDIT_LIMIT: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
  /** Turnstile's secret; until it's set, the check is skipped (local runs) */
  TURNSTILE_SECRET?: string;
  /** audits a day across the site before new ones are held (wrangler.jsonc) */
  AUDIT_DAILY_CAP?: string;
}

type Fields = Record<string, unknown>;

const DAY_MS = 24 * 60 * 60 * 1000;
const PER_VISITOR_PER_DAY = 3;
const SAME_SITE_DAYS = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const fail = (status: number, error: string) => json({ error }, status);

class Invalid extends Error {}

const text = (value: unknown, max: number, label: string): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new Invalid(`${label} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Invalid(`${label} is too long.`);
  return trimmed || null;
};

/**
 * The website to audit, as a full address, and its domain. Only a public
 * site on the web: never an IP address, this machine, a private network, an
 * odd port, or gios.build itself, since later phases fetch it from here.
 */
export function websiteFrom(value: unknown): { url: string; domain: string } {
  let raw = text(value, 300, 'Website');
  if (!raw) throw new Invalid('Please enter your website.');
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Invalid('That doesn’t look like a website address. Try something like yourbusiness.co.uk.');
  }
  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  const notPublic =
    !['http:', 'https:'].includes(parsed.protocol) ||
    (parsed.port !== '' && parsed.port !== '80' && parsed.port !== '443') ||
    parsed.username !== '' ||
    !host.includes('.') ||
    /^[\d.]+$/.test(host) ||
    host.includes(':') ||
    host === 'localhost' ||
    /\.(local|localhost|internal|lan|home|test|example|invalid)$/.test(host);
  if (notPublic) throw new Invalid('Please enter your business’s public website, like yourbusiness.co.uk.');
  const domain = host.replace(/^www\./, '');
  if (domain === 'gios.build' || domain.endsWith('.gios.build')) throw new Invalid('Please enter your own business’s website.');
  return { url: `${parsed.protocol}//${host}${parsed.pathname === '/' ? '/' : parsed.pathname}`, domain };
}

/** a one-way hash of the visitor's IP, so the daily limit works without
 *  keeping the address itself */
async function hashIp(ip: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`gios.build audit ${ip}`));
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Cloudflare Turnstile's verdict on the form's token */
async function humanEnough(env: AuditEnv, token: unknown, ip: string) {
  if (!env.TURNSTILE_SECRET) return true;
  if (typeof token !== 'string' || !token) return false;
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET.trim(), response: token, remoteip: ip }),
  });
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

/** how many audits match a filter, from Supabase's count header */
async function count(env: AuditEnv, filter: string) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/audits?select=id&${filter}`, {
    method: 'HEAD',
    headers: {
      apikey: (env.SUPABASE_SECRET_KEY ?? '').trim(),
      Prefer: 'count=exact',
    },
  });
  if (!response.ok) throw new Error('database');
  return Number(response.headers.get('Content-Range')?.split('/')[1] ?? 0);
}

async function request(req: Request, env: AuditEnv, body: Fields, ip: string) {
  // the hidden "company" field: people never see it, bots fill it in.
  // Answer as if it worked and save nothing.
  if (body.company) return json({ ok: true });

  const { url, domain } = websiteFrom(body.website);
  const email = text(body.email, 254, 'Email');
  if (!email || !EMAIL_PATTERN.test(email)) throw new Invalid('Please enter a valid email.');
  const phone = text(body.phone, 40, 'Phone number');
  if (!phone || phone.replace(/\D/g, '').length < 7) throw new Invalid('Please enter a phone number.');
  const wantsMoreOf = text(body.wants_more_of, 200, 'What you want more of');
  if (body.consent !== true) throw new Invalid('Please tick the box so the report can be sent to you.');

  if (!(await humanEnough(env, body.turnstile, ip))) {
    return fail(400, 'Please complete the “I’m human” check and try again.');
  }

  const ipHash = await hashIp(ip);
  const now = Date.now();
  const dayAgo = new Date(now - DAY_MS).toISOString();
  if ((await count(env, `ip_hash=eq.${ipHash}&created_at=gt.${dayAgo}`)) >= PER_VISITOR_PER_DAY) {
    return fail(429, 'That’s the most audits for one day. Please try again tomorrow, or email contact@gios.build.');
  }

  // the same site within 30 days: no second audit, but the request still
  // reaches the inbox (it may be someone new at the same business)
  const recent = await db(
    env,
    `audits?domain=eq.${encodeURIComponent(domain)}&created_at=gt.${new Date(now - SAME_SITE_DAYS * DAY_MS).toISOString()}&select=id&order=created_at.desc&limit=1`
  );
  const repeat = recent.length > 0;

  // past the daily cap, requests are kept but held for Gio
  const cap = Number(env.AUDIT_DAILY_CAP ?? 50);
  const today = new Date(new Date(now).toISOString().slice(0, 10)).toISOString();
  const held = !repeat && (await count(env, `created_at=gte.${today}`)) >= cap;

  const contactId = await contactFor(env, { name: domain, email, phone, industry: null });

  const [inquiry] = await db(env, 'booking_inquiries', {
    method: 'POST',
    body: JSON.stringify({
      contact_id: contactId,
      name: domain,
      email,
      phone,
      selected_types: [],
      message: [
        repeat ? `Website audit requested again for ${url} (already audited in the last ${SAME_SITE_DAYS} days).` : `Website audit requested for ${url}.`,
        wantsMoreOf && `Wants more: ${wantsMoreOf}`,
        held && 'Held: past the daily audit cap.',
      ].filter(Boolean).join('\n\n'),
      source_page: AUDIT_PATH,
      user_agent: req.headers.get('User-Agent')?.slice(0, 400) ?? null,
    }),
  });

  if (!repeat) {
    const sourcePage = text(body.source_page, 200, 'Page');
    await db(env, 'audits', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        url,
        domain,
        email,
        phone,
        wants_more_of: wantsMoreOf,
        consent_text: AUDIT_CONSENT,
        consent_at: new Date(now).toISOString(),
        ip_hash: ipHash,
        source_page: sourcePage?.startsWith('/') ? sourcePage : AUDIT_PATH,
        user_agent: req.headers.get('User-Agent')?.slice(0, 400) ?? null,
        status: held ? 'held' : 'queued',
        inquiry_id: inquiry?.id ?? null,
      }),
    });
  }

  return json({ ok: true });
}

/** Handles /api/audit; returns null for any other path. */
export async function audit(req: Request, env: AuditEnv, pathname: string): Promise<Response | null> {
  if (pathname !== '/api/audit') return null;
  if (req.method !== 'POST') return fail(405, 'Not allowed.');

  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.AUDIT_LIMIT.limit({ key: ip });
  if (!success) return fail(429, 'That’s a lot of requests at once. Please wait a minute and try again.');

  let body: Fields;
  try {
    body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return fail(400, 'Something went wrong sending the form. Please try again.');
  }

  try {
    return await request(req, env, body, ip);
  } catch (error) {
    if (error instanceof Invalid) return fail(400, error.message);
    console.error('audit', error);
    return fail(500, 'Something went wrong on our side. Please try again, or email contact@gios.build.');
  }
}
