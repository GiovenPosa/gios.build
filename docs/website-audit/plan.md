# Website Audit: implementation plan

**Spec:** [spec.md](spec.md) · **Written:** 14 Nov 2026 · **Status:** Phase 1 built (14 Nov 2026); Turnstile set up and the migration run; waiting to be pushed and tested live

Five phases. Each one ships something that works on its own, so the feature
can stop at any phase and still be useful. The section numbers (§) refer to
the spec.

---

## Before building: Gio's setup checklist

All of these can be done in one sitting (about an hour). Phase 1 only needs
items 1 and 5.

1. **Cloudflare Turnstile** (free): Cloudflare dashboard → Turnstile → add a
   site for `www.gios.build` (Managed mode). Keep the site key (public) and
   the secret.
2. **Claude API key:** Claude Console → API keys → create one called
   "gios.build audits". In Billing, set a **monthly spend limit**, e.g. £20.
3. **Google Cloud:** create a project called "gios-build-audit".
   - Enable the **PageSpeed Insights API** and create an API key, restricted
     to that API.
   - Optional, for §5.3: enable the **Places API (New)** and turn on billing,
     with a budget alert. Add Places to the same key's restrictions.
4. **Resend** (free): sign up, add the domain `send.gios.build`, and copy
   its DNS records into Cloudflare DNS (they're on the subdomain, so
   Microsoft 365 email is untouched). Wait for "Verified", then create an
   API key.
5. **Supabase:** run the migration this plan adds (Phase 1) in the SQL
   editor, as with earlier migrations.
6. **Cloudflare Workers plan:** check whether Workflows needs the paid plan
   for our use. Phase 2 confirms this, and upgrades only if needed.

Secrets then go in with `npx wrangler secret put <NAME>` (the names are in
spec §15).

---

## Phase 1: the page, the form, and leads (no AI yet)

**Outcome:** `/website-audit` is live. Requests are saved and show in the
lead app as leads, with an alert. Gio does the audits by hand while the rest
is built.

| # | Task | Files |
|---|---|---|
| 1.1 | `audits` table, with status values and row-level security (spec §13) | `supabase/migrations/2026MMDD_audits.sql` |
| 1.2 | Lead app: confirm the `booking_inquiries` columns; add `source` (if missing) and `audit_id` | lead app `supabase/migrations/…_inquiry_audit.sql` |
| 1.3 | Worker endpoint `POST /api/audit`: validate the fields, normalise the URL and domain, block private, local and own-domain targets, verify Turnstile, apply the per-IP limit, the 30-day rule and the daily cap, save, create the `booking_inquiries` row (source "Website audit"), and reply | `worker/audit.ts`, `worker/index.ts`, `wrangler.jsonc` (the `AUDIT_LIMIT` binding) |
| 1.4 | The page: the shared hero ("Is your website winning you work?"), what you get, a sample report (cleaned up from the NW audit, no names), the form with Turnstile, the consent tick, a thank-you state, and an FAQ | `src/pages/auditPage.tsx`, `src/pages/page-styles/auditPage.css`, `src/data/audit.ts` |
| 1.5 | SEO for the page: title, description, share image, structured data (`Service` and `FAQPage`), sitemap | `src/data/seo.ts`, `src/data/schema.ts`, `public/og/audit.jpg`, `vite.config.ts` |
| 1.6 | Links to it: footer, the area and industry pages ("Already have a website? Get a free audit"), the outreach playbook | `footer.tsx`, `areaPage.tsx`, `industryPage.tsx` |
| 1.7 | Privacy page: the audits section (spec §11) | `src/pages/privacyPage.tsx` |
| 1.8 | Local dev stand-in for `/api/audit`, like `localEnquiry()` | `vite.config.ts` |

**As built (14 Nov 2026):**
- 1.2 wasn't needed. `booking_inquiries` already has `source_page`, so audit
  requests go in as they are: the domain as the name, `source_page`
  `/website-audit`, and the request in the message. The `audits.inquiry_id`
  column links back to it, and the lead app is unchanged.
- **Daily limits:** the per-minute limit is the `AUDIT_LIMIT` binding (5 a
  minute; the binding only counts per 10 or 60 seconds). The three-a-day limit
  counts `audits` rows by `ip_hash`.
- **Turnstile** stays off until both keys are in:
  - the site key in `TURNSTILE_SITE_KEY` (`src/data/audit.ts`);
  - the secret as the Worker's `TURNSTILE_SECRET`.

  Set both together: with only the secret set, every request fails.
- **Turnaround copy:** "within one working day" (`AUDIT_TURNAROUND`), since
  the audits are done by hand until Phase 4.
- **Footer:** the two-column breakpoint moved from 700px to 800px to fit the
  new "Website audit · Free" link.

**Done when:**
- A test request from the live page appears in the lead app's inbox and
  sends a push.
- A second request for the same site within 30 days doesn't create a new
  audit.
- A request for `localhost` or an IP address is refused.
- The page passes Lighthouse on phones (performance 90 or more, SEO 100).

---

## Phase 2: gathering the facts in the background

**Outcome:** each request is followed within a minute or two by its facts
JSON. Gio sees the speed scores and findings in the lead app, which makes
the manual audits much faster.

| # | Task | Files |
|---|---|---|
| 2.1 | Cloudflare Workflow `audit`, with steps that retry on their own; started by `POST /api/audit` | `worker/auditWorkflow.ts`, `wrangler.jsonc` |
| 2.2 | PageSpeed step: mobile and desktop, kept fields only (spec §5.1), screenshot saved | `worker/audit/pagespeed.ts` |
| 2.3 | Site reader: robots, sitemap, up to 10 pages, the HTML parsed with `HTMLRewriter`, size and time limits (spec §5.2) | `worker/audit/crawl.ts` |
| 2.4 | Places step behind `AUDIT_PLACES`: search, match by domain, compare name, address and phone (spec §5.3) | `worker/audit/places.ts` |
| 2.5 | Put the facts together and save them with each status change | `worker/audit/facts.ts` |
| 2.6 | Lead app: an "Audit" panel on the lead, showing the scores, the key facts and the status | lead app `src/app/(dashboard)/lead/…` |
| 2.7 | Test runs on NW Auto Wash and Elite Auto Care, compared with the hand-made audits | — |

**Done when:**
- The NW Auto Wash facts show the same results as the hand-made audit:
  - phone performance around 51;
  - nearby towns at 0 mentions;
  - the name and address mismatch.
- A site that blocks the bot fails cleanly, with a reason.

---

## Phase 3: Claude writes the report, and the report page

**Outcome:** each audit gets a report draft, checked automatically and shown
on its private page. It's held for review; nothing is emailed yet.

| # | Task | Files |
|---|---|---|
| 3.1 | The offer, generated from the site's own data so prices never drift | `src/data/auditOffer.ts`, from `packages.ts`, `services.ts` and `faq.ts` |
| 3.2 | Prompt v1: the system prompt with the house rules, the offer, `<facts>`, `<site_content>` (untrusted) | `worker/audit/prompt.ts` |
| 3.3 | Claude call: Messages API with the tool-shaped output (spec §7), the model from `AUDIT_MODEL`, tokens recorded | `worker/audit/write.ts` |
| 3.4 | Checker: shape, numbers, evidence, tone and package (spec §8); results saved to `checks` | `worker/audit/check.ts` |
| 3.5 | `GET /api/audit/report/:reportId`, with the noindex header and view counting | `worker/audit.ts` |
| 3.6 | Report page at `/report/:id`, in the site's style (spec §10). The mockup button opens the enquiry form already filled in. | `src/pages/reportPage.tsx`, `src/pages/page-styles/reportPage.css`, `src/App.tsx`, `public/robots.txt` |
| 3.7 | Lead app: read the draft, edit its text, and see the checks | lead app |

**Done when:**
- The NW and Elite reports reach the main findings from spec §18.
- No report has a number that isn't in its facts. The checker catches one
  planted on purpose.
- The report page reads well on a phone, and Gio is happy with the tone on
  both baselines.

---

## Phase 4: sending, alerts and the review switch

**Outcome:** the full loop. Reports reach the visitor's inbox, either after
Gio's tap or automatically.

| # | Task | Files |
|---|---|---|
| 4.1 | Email through Resend: the template, the reply-to address, and the plain-text version | `worker/audit/email.ts` |
| 4.2 | `POST /api/audit/:id/send` and `/rerun`, protected by `AUDIT_ADMIN_TOKEN` | `worker/audit.ts` |
| 4.3 | Lead app: "Send report", "Re-run" and "Don't send" buttons; "Opened 3 times" | lead app |
| 4.4 | The `AUDIT_AUTO_SEND` switch in the Workflow's last step | `worker/auditWorkflow.ts` |
| 4.5 | Umami events: Audit requested, Report viewed, Mockup from report | `src/lib/analytics.ts`, the pages |

**Done when:**
- End to end on the live site:
  - a test request gets its email;
  - the report opens and the views are counted;
  - the mockup button creates an enquiry linked to the audit.

---

## Phase 5: tuning, then launch

**Outcome:** confidence to switch auto-send on.

| # | Task |
|---|---|
| 5.1 | Run about 10 local sites of different kinds (none, Wix, WordPress, custom, café, trade, salon). Gio scores each for accuracy, tone and the right package. |
| 5.2 | Adjust the prompt; bump `prompt_version`; re-run the weak ones |
| 5.3 | Decide on auto-send: on if about 9 in 10 pass review without edits |
| 5.4 | Launch:
  - add the audit to the outreach playbook's scripts;
  - link it from the home page FAQ;
  - announce it on Instagram. |
| 5.5 | Record the outcome in memory (what was built, the settings, the costs seen) |

---

## Order of work and size

| Phase | Depends on | Roughly |
|---|---|---|
| 1 | Turnstile, the migration | one working session |
| 2 | Google key; the Workflows plan check | one session |
| 3 | Claude key | one to two sessions, mostly prompt work |
| 4 | Resend verified | one session |
| 5 | real sites to test | spread over a week, alongside outreach |

## What gets reused
- **Layout and design:**
  - the shared `PageHero`;
  - the area pages' card styles, for the report's problem cards;
  - the FAQ thread;
  - the enquiry form, which the mockup button opens already filled in.
- **Worker:** the enquiry endpoint's patterns (field checks, the rate
  limiter, writing with the Supabase secret key, contact matching).
- **Build:** `vite.config.ts`'s page heads, structured data and sitemap
  steps, which pick up the new page from `seo.ts` and `schema.ts`.
- **The lead app's existing pipeline:** inbox, push, contacts, leads.
- **What to check:** the hand-made NW Auto Wash audit
  (`~/Downloads/NW-Auto-Wash-Website-Audit.pdf`, Nov 2026). Its checks and
  methodology section are the reference for spec §5, and its findings are
  the test baseline. The script that built it lived in a temporary folder
  and is gone; the PDF is the record.
