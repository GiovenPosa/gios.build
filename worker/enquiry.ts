// The enquiry form's endpoint. The form is a three-step wizard, and each step
// is saved as the visitor goes, so their contact details are kept from step 1
// even if they never finish:
//
//   POST  /api/enquiry           step 1: name, email, phone. Creates a draft
//                                and returns its id.
//   PATCH /api/enquiry/:id       step 2 (or step 1 again, after going back):
//                                saves the fields sent onto the draft.
//   POST  /api/enquiry/:id/send  step 3: budget and message. Checks the whole
//                                enquiry and copies it into booking_inquiries,
//                                where the lead app and its push notification
//                                pick it up.
//
// Drafts live in enquiry_drafts (supabase/migrations). Everything is written
// with the Supabase secret key, which only this Worker holds.

import { BUSINESS_TYPES, ENQUIRY_PACKAGES, EMAIL_PATTERN } from '../src/data/enquiry';

export interface EnquiryEnv {
  /** e.g. https://<project>.supabase.co, set in wrangler.jsonc */
  SUPABASE_URL: string;
  /** a Supabase secret key (sb_secret_…), set with `wrangler secret put` */
  SUPABASE_SECRET_KEY: string;
  /** Cloudflare's rate limiter, per visitor IP (wrangler.jsonc) */
  ENQUIRY_LIMIT: { limit: (options: { key: string }) => Promise<{ success: boolean }> };
}

type Fields = Record<string, unknown>;

// a draft can be finished for a day after it was started
const DRAFT_LIFETIME_MS = 24 * 60 * 60 * 1000;
const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const PACKAGE_IDS = ENQUIRY_PACKAGES.map((pkg) => pkg.id);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const fail = (status: number, error: string) => json({ error }, status);

class Invalid extends Error {}

/* ---------- Checking what the browser sent ---------- */

const text = (value: unknown, max: number, label: string): string | null => {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') throw new Invalid(`${label} must be text.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Invalid(`${label} is too long.`);
  return trimmed || null;
};

/** Step 1's fields, required whenever any of them is sent. */
function contact(body: Fields) {
  const name = text(body.name, 120, 'Name');
  const email = text(body.email, 254, 'Email');
  if (!name) throw new Invalid('Please enter your name.');
  if (!email || !EMAIL_PATTERN.test(email)) throw new Invalid('Please enter a valid email.');
  return { name, email, phone: text(body.phone, 40, 'Phone number') };
}

/** Step 2's fields. Only checked for shape here; /send checks they're filled in. */
function project(body: Fields) {
  const types = body.selected_types ?? [];
  if (!Array.isArray(types) || !types.every((type) => BUSINESS_TYPES.includes(type))) {
    throw new Invalid('Please choose your kind of business from the list.');
  }
  const pkg = body.selected_package ?? null;
  if (pkg !== null && !PACKAGE_IDS.includes(pkg as string)) throw new Invalid('Please choose a package from the list.');
  return {
    current_site: text(body.current_site, 200, 'Current website'),
    selected_types: types as string[],
    selected_package: pkg as string | null,
  };
}

/** Step 3's fields. */
function details(body: Fields) {
  let budget: number | null = null;
  if (body.budget !== undefined && body.budget !== null && body.budget !== '') {
    budget = Number(body.budget);
    if (!Number.isFinite(budget) || budget < 0 || budget > 1_000_000) throw new Invalid('Please enter a budget in pounds.');
    budget = Math.round(budget);
  }
  return { budget, message: text(body.message, 5000, 'Message') };
}

/* ---------- Supabase ---------- */

async function db(env: EnquiryEnv, path: string, init: RequestInit = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SECRET_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...init.headers,
    },
  });
  if (!response.ok) {
    // logged for the Worker's observability; the visitor gets a plain message
    console.error('Supabase', response.status, await response.text());
    throw new Error('database');
  }
  // return=minimal answers with an empty body
  const rows = await response.text();
  return (rows ? JSON.parse(rows) : []) as Fields[];
}

/** Saves fields onto an open draft and returns the whole draft, or null if
 *  it doesn't exist, was already sent, or is too old to finish. */
async function saveDraft(env: EnquiryEnv, id: string, fields: Fields) {
  const since = new Date(Date.now() - DRAFT_LIFETIME_MS).toISOString();
  const rows = await db(env, `enquiry_drafts?id=eq.${id}&completed_at=is.null&created_at=gt.${since}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
  return rows[0] ?? null;
}

/* ---------- Routes ---------- */

async function start(request: Request, env: EnquiryEnv, body: Fields) {
  // the hidden "website" field: people never see it, bots fill it in. Answer
  // as if it worked and save nothing.
  if (body.website) return json({ id: crypto.randomUUID() });

  const sourcePage = text(body.source_page, 200, 'Page');
  const [draft] = await db(env, 'enquiry_drafts', {
    method: 'POST',
    body: JSON.stringify({
      ...contact(body),
      step: 1,
      source_page: sourcePage?.startsWith('/') ? sourcePage : null,
      user_agent: request.headers.get('User-Agent')?.slice(0, 400) ?? null,
    }),
  });
  return json({ id: draft.id });
}

async function update(env: EnquiryEnv, id: string, body: Fields) {
  const fields: Fields = {};
  if ('name' in body || 'email' in body) Object.assign(fields, contact(body));
  if ('selected_types' in body || 'selected_package' in body || 'current_site' in body) {
    Object.assign(fields, project(body), { step: 2 });
  }
  if (Object.keys(fields).length === 0) return fail(400, 'Nothing to save.');
  const draft = await saveDraft(env, id, fields);
  if (!draft) return fail(404, 'This enquiry has expired. Please close the form and start again.');
  return json({ id });
}

async function send(env: EnquiryEnv, id: string, body: Fields) {
  const draft = await saveDraft(env, id, details(body));
  if (!draft) return fail(404, 'This enquiry has expired. Please close the form and start again.');

  const types = (draft.selected_types as string[] | null) ?? [];
  if (types.length === 0) return fail(400, 'Please choose at least one kind of business.');
  if (!draft.selected_package) return fail(400, 'Please choose a package.');

  await db(env, 'booking_inquiries', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      selected_types: types,
      selected_package: draft.selected_package,
      budget: draft.budget,
      // booking_inquiries has no column for the current site, so it travels
      // in the message, as it always has
      message: [draft.current_site && `Current website: ${draft.current_site}`, draft.message]
        .filter(Boolean).join('\n\n') || null,
      source_page: draft.source_page,
      user_agent: draft.user_agent,
    }),
  });
  await saveDraft(env, id, { step: 3, completed_at: new Date().toISOString() });
  return json({ ok: true });
}

/** Handles /api/enquiry and below; returns null for any other path. */
export async function enquiry(request: Request, env: EnquiryEnv, pathname: string): Promise<Response | null> {
  const match = pathname.match(/^\/api\/enquiry(?:\/([^/]+))?(\/send)?$/);
  if (!match) return null;
  const [, id, isSend] = match;
  if (id && !ID_PATTERN.test(id)) return fail(404, 'Enquiry not found.');

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const { success } = await env.ENQUIRY_LIMIT.limit({ key: ip });
  if (!success) return fail(429, "That's a lot of requests at once. Please wait a minute and try again.");

  let body: Fields;
  try {
    body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
  } catch {
    return fail(400, 'Something went wrong sending the form. Please try again.');
  }

  try {
    if (!id && request.method === 'POST') return await start(request, env, body);
    if (id && !isSend && request.method === 'PATCH') return await update(env, id, body);
    if (id && isSend && request.method === 'POST') return await send(env, id, body);
    return fail(405, 'Not allowed.');
  } catch (error) {
    if (error instanceof Invalid) return fail(400, error.message);
    return fail(500, 'Something went wrong on my side. Please try again, or email contact@gios.build.');
  }
}
