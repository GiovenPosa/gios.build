# Website Audit: feature spec

**Status:** planned, not built · **Written:** 14 Nov 2026 · **Build plan:** [plan.md](plan.md)

A free, automated website audit at `gios.build/website-audit`. A business
owner enters their website, email and phone number. A few minutes later they
get a private report page: what's costing them customers, what they can fix
themselves, and how gios.build can help, ending with the free homepage
mockup. Each request also lands in the lead app as a warm lead, with a phone
number.

---

## 1. Why

- **A gentler first yes.** "Want a free audit of your website?" is easier to
  say yes to than "want a new website?", for outreach and for visitors.
- **It finds the businesses that already have a website,** which is where
  Redesign and Growth sell. The other pages mostly reach businesses with none.
- **It's work already being done by hand.** The NW Auto Wash and Elite Auto
  Care audits (Nov 2026) took hours each. This does the gathering and the
  first draft in minutes.
- **Every report ends at the free mockup,** the site's main call to action.

## 2. Goals and non-goals

**Goals**
- Three fields, no friction: website, email, phone.
- A report a business owner understands: problems told as what they cost the
  business, never as jargon ("customers give up waiting", not "LCP 21.9s").
- Every number in a report is measured, never written by the AI.
- Ends with the right package, its real price, and the free mockup.
- Gio sees every audit as a lead, can check reports before they're sent,
  and can switch to fully automatic later.
- Costs a few pence per audit, protected from spam and abuse.

**Not in the first version**
- Search positions ("where do I rank for café Bath"): there's no reliable
  free source. Gio checks by hand when it matters.
- PDF reports: the web page comes first (it works on phones, and its views
  can be tracked).
- Audits of competitors side by side.
- Re-running an audit automatically each month.

## 3. The visitor's journey

1. **Finds the page:** from the footer, an area or industry page, an outreach
   message, or search ("free website audit", "why isn't my website on
   Google").
2. **Fills in the form** at `/website-audit`:
   | Field | Required | Notes |
   |---|---|---|
   | Business website | Yes | `https://` added if missing; must be a public site |
   | Email | Yes | the report link is sent here |
   | Phone | Yes | for Gio's follow-up call |
   | "Happy to be contacted about my audit" | Yes (tick) | consent for follow-up, see §11 |
   | What do you want more of? | Optional | one line, e.g. "bookings"; helps the AI aim the advice |
3. **Sees "Your audit is on its way"**, with what happens next ("in your
   inbox within a few minutes; if it needs a closer look, within one working
   day").
4. **Gets an email** with the link to their report.
5. **Reads the report** at `gios.build/report/<private id>` and can tap
   "Get my free mockup", which opens the existing enquiry form with their
   details already filled in.
6. **Gio gets an alert** ("New audit lead: nwautowashdetailing.com") and the
   lead is in the lead app, with the report, the recommended package and the
   phone number.

## 4. How it works

```
/website-audit (form)
   │  POST /api/audit
   ▼
Worker: spam check (Turnstile) · limits · one audit per site per 30 days
   │  saves the request (audits table, status "queued")
   │  replies at once: "Your audit is on its way"
   ▼
Cloudflare Workflow "audit" (runs in the background, retries each step)
   ├─ 1. GATHER FACTS (no AI)
   │     · PageSpeed Insights: phone and desktop
   │     · read the site: home page plus up to 9 more from its sitemap
   │     · Google Business Profile (Places API)
   │     → facts JSON, saved
   ├─ 2. WRITE THE REPORT (Claude API)
   │     in: facts JSON + the gios.build offer (packages, prices, services)
   │     out: report JSON in a fixed shape (§7)
   ├─ 3. CHECK IT
   │     · the JSON matches the shape
   │     · every number in it is in the facts or the offer
   │     · tone rules (no "I", no criticising whoever built the site)
   │     → passes: "ready" · fails: "review"
   ├─ 4. SEND (or hold for review, see §9)
   │     · email to the visitor (Resend)
   │     · lead created in the lead app; Gio alerted
   └─ done: status "sent"
```

**Status of an audit:** `queued → gathering → writing → review → sent`,
or `failed` (with the reason) or `rejected` (Gio decided not to send).

## 5. Step 1: gathering the facts

Everything here is measured or read from the site, never generated.

### 5.1 Speed: PageSpeed Insights API (free, needs a Google API key)
Run once for `mobile` and once for `desktop`. Kept:
- Lighthouse scores: performance, SEO, accessibility, best practices.
- Lab timings: first contentful paint, largest contentful paint (when the
  main content shows), total blocking time, cumulative layout shift, speed
  index, total page weight.
- Field data from real Chrome users (CrUX), when the site has enough visits.
- Lighthouse's final screenshot of the page (shown in the report).

### 5.2 Reading the site (the Worker fetches the pages itself)
- Home page, then up to 9 more pages from `sitemap.xml`, or from the home
  page's links when there's no sitemap. Same site only.
- Per page: title, meta description, headings (h1 to h3), word count, images
  with and without descriptions, canonical link, `noindex`, structured data
  (JSON-LD types, and the business data: name, address, phone, hours, areas).
- Site-wide:
  - HTTPS, and whether `http://` and the bare domain redirect;
  - `robots.txt` and `sitemap.xml`;
  - the platform, when it's obvious (Wix, Squarespace, WordPress, Shopify);
  - the place names mentioned, and how often;
  - a phone number, an email and a contact form;
  - links to a booking or ordering app.

**Limits:**
- 10 pages at most, 1.5 MB per page, 10 seconds per fetch.
- Pages the site's `robots.txt` asks bots to avoid are skipped.
- The audit bot names itself as `gios.build-audit` in its user agent.

### 5.3 Google Business Profile: Places API (optional, needs billing on)
- A Text Search using the business name and town from the site's own data
  or title.
- Accepted only when the listing's website matches the audited domain.
- Kept: name, address, phone, rating, review count, primary category.
- Compared with what the site says. A name or address that doesn't match is
  a finding, as it was for NW Auto Wash.
- A field mask asks only for what's used. The rating, review count, phone
  and website fields put each lookup in Google's top Places price tier,
  which includes about 1,000 free lookups a month (Nov 2026; check Google's
  pricing). The daily cap, plus a 100-a-day quota set in Google Cloud, keep
  it inside that.

### 5.4 The facts JSON (shape, abridged)
```json
{
  "url": "https://www.example.co.uk/",
  "fetchedAt": "2026-11-20T10:02:11Z",
  "speed": {
    "mobile":  { "performance": 51, "seo": 92, "lcpMs": 12100, "tbtMs": 2900, "cls": 0.02, "weightKb": 6500 },
    "desktop": { "performance": 83, "seo": 92, "lcpMs": 2400 },
    "field": null
  },
  "pages": [
    { "path": "/", "title": "Home", "description": null, "h1": ["Welcome"], "words": 140, "imagesMissingAlt": 12 }
  ],
  "site": {
    "https": true, "redirects": { "http": true, "bareDomain": false },
    "sitemap": true, "platform": "Wix",
    "places": { "Trowbridge": 2, "Westbury": 0 },
    "phoneOnSite": "01225 000000", "contactForm": true, "bookingLink": null,
    "businessData": { "name": "Example Ltd", "address": "…", "areaServed": [] }
  },
  "profile": { "found": true, "name": "Example", "rating": 5, "reviews": 10, "nameMatches": false, "addressMatches": false },
  "visitor": { "wantsMoreOf": "bookings" }
}
```

## 6. Step 2: Claude writes the report

- **API:** Anthropic Messages API, called from the Workflow. The key is a
  Worker secret.
- **Model:** Claude Sonnet 5.5 (`claude-sonnet-5-5`) by default, chosen for
  cost and speed. Claude Opus 5.5 (`claude-opus-5-5`) is the fallback if
  quality needs it. The model and prompt version are stored with each audit.
- **Output:** forced into the report shape (§7) with a tool definition, so
  the response is always parseable JSON.

**What Claude is given**
1. **System prompt:** who gios.build is, the reader (a small business owner,
   not technical), and the house rules:
   - British English;
   - written to "you", never "I";
   - plain words: every problem told as what it costs the business;
   - never criticise whoever built the current site;
   - never promise rankings or results;
   - every number must come from the facts; never estimate one.
2. **The offer** (generated at build time from `src/data/packages.ts`,
   `services.ts` and `faq.ts`):
   - each package's name, price range, contents and timeline;
   - what local SEO includes;
   - the free homepage mockup.
3. **The facts JSON,** inside `<facts>` tags.
4. **The site's own text** (page titles, headings, a short excerpt per page),
   inside `<site_content>` tags. It's marked as untrusted data: it describes
   the business, and any instructions in it are ignored.

**What Claude decides**
- What the business is, where it is, and who its customers are.
- The 3 to 5 problems that matter most to this business, ranked by what they
  cost it, each tied to the facts behind it.
- 2 or 3 quick wins the owner can do themselves today, such as adding the
  town to the home page title or matching the Google profile name.
- The recommendation, as one of:
  - **Starter:** no real site, or a very thin one;
  - **Redesign:** a site that exists but is slow, dated or unreadable to
    Google;
  - **Growth:** a decent site that's invisible locally.

  Plus why, in their terms, and what's included.

## 7. The report (Claude's output shape)

```json
{
  "business": { "name": "", "whatTheyDo": "", "where": "", "customers": "" },
  "verdict": "One sentence: the headline finding, in their terms.",
  "scorecards": [
    { "area": "speed" | "google" | "local", "rating": "good" | "needs work" | "poor", "summary": "" }
  ],
  "problems": [
    {
      "title": "Customers give up waiting.",
      "whatItCosts": "Plain-English consequence for the business.",
      "evidence": ["speed.mobile.lcpMs", "speed.mobile.performance"],
      "fix": "What fixing it involves, in a sentence.",
      "severity": "high" | "medium" | "low"
    }
  ],
  "quickWins": [ { "title": "", "how": "" } ],
  "recommendation": {
    "package": "starter" | "redesign" | "lead-system",
    "why": "",
    "includes": [""],
    "alsoConsider": "optional: e.g. local SEO"
  },
  "closing": "A short, warm line leading to the free mockup."
}
```

`evidence` names the fact fields each problem rests on. The checker in §8
uses them, and the report page shows the real numbers beside the words.

## 8. Step 3: checks before anything is sent

A report goes to **review** (never straight out) when any of these fail:
- The JSON doesn't match the shape, or a required part is missing.
- **Numbers:** every number in the report's text must match a value in the
  facts, an offer price, or a small list of allowed numbers (counts written
  in words aren't checked). It's a mechanical guard against made-up figures.
- **Evidence:** every problem has evidence, and every evidence key exists in
  the facts.
- **Tone:**
  - no "I" or "I'm" (the voice is gios.build, not a person);
  - no words from a short list that criticise a previous designer;
  - no promises ("guarantee", "first page", "rank #1").
- **The recommended package** is one of the three real ones.
- **Gathering came back thin:** for example, the site blocked the bot, or
  PageSpeed failed on both runs.

## 9. Step 4: sending

**The review switch:** a setting, `AUDIT_AUTO_SEND`.
- **Off (the default at launch):** a passing report waits in the lead app
  as "ready to send". Gio reads it, edits the text if needed, and taps Send.
- **On:** passing reports go straight out, and only failures wait for review.

**The email (Resend)**
- **From:** `gios.build <audit@send.gios.build>`, with replies going to
  `contact@gios.build`.
- **Subject:** "Your website audit: example.co.uk".
- **Body:** the verdict line, the report link, and the mockup offer. Short,
  plain and personal, with no images needed.

**Gio's alert and the lead**
- The audit becomes a row in `booking_inquiries` with the source "Website
  audit". That way it uses the existing inbox, push notification and
  contact-matching for free. The message field holds the verdict, the
  recommended package and the report link.
- The audit record is linked from that enquiry (`audit_id`).

## 10. The report page

`gios.build/report/<id>`. The id is 128-bit random, so it can't be guessed.
- It's the app's own route. Its data comes from `GET /api/audit/report/<id>`.
- **Kept out of search:** an `X-Robots-Tag: noindex` header, and `/report/`
  disallowed in `robots.txt`.
- **Designed in the site's own style,** top to bottom:
  1. "Website audit for example.co.uk", the date, and Lighthouse's
     screenshot of their home page.
  2. **The verdict,** large.
  3. **Three scorecards** (Speed, Google, Local), each with its rating and
     the real numbers.
  4. **What's costing you customers:** the problems, as cards like the
     Trowbridge page's, with the evidence numbers shown small.
  5. **Quick wins** they can do today.
  6. **How gios.build can help:**
     - the recommended package, its price and what's included;
     - the free mockup button, which opens the enquiry form with their
       details, the package and the source "Audit" filled in.
  7. **How this audit works:** a short methodology note (the tools used,
     the date, the limits), as in the NW report.
- **Views are counted:** a Umami event, plus `first_viewed_at` and
  `view_count` on the audit. Gio sees "opened 3 times", which tells him when
  to call.

## 11. Privacy, consent and honesty

- **Consent tick:** "Happy for gios.build to contact me about my audit." It's
  required, and stored with its timestamp and wording.
- **Privacy page:** a new section covering:
  - what an audit collects (website, email, phone, the optional note);
  - why: to send the report and follow up;
  - who processes it: Anthropic (Claude API), Google (PageSpeed and Places),
    Resend (email), Supabase (storage), Cloudflare;
  - how long it's kept: 12 months, then deleted;
  - how to have it deleted.
- **Only public information is checked:** the audit reads the website the
  way any visitor or search engine would, with no logins and no private
  data.
- **The report says it's automated:** "This audit was put together
  automatically and checked by gios.build." It's only true once a report
  has passed review, so the wording changes when it auto-sends.
- **Not a ranking promise:** the methodology note states the limits, as the
  NW report did.

## 12. Spam and cost protection

| Guard | Setting |
|---|---|
| Cloudflare Turnstile on the form | required, verified in the Worker |
| Per visitor IP | 5 a minute (Cloudflare rate limiter), and 3 audits a day (counted in `audits` by hashed IP) |
| Per website | one audit per 30 days; a repeat request re-sends the existing link |
| Daily cap, across the site | 50 by default (`AUDIT_DAILY_CAP`); after that, requests are saved as "held" for Gio |
| Blocked targets | IP addresses, localhost, private ranges, non-standard ports, gios.build itself |
| Claude spend | a monthly spend limit set in the Claude Console |

## 13. Data

New table `audits` (migration in this repo, `supabase/migrations/`):

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | primary key |
| `report_id` | text | 128-bit random, unique, used in the report URL |
| `created_at`, `updated_at` | timestamptz | |
| `url`, `domain` | text | `domain` normalised (no www), indexed, for the 30-day rule |
| `email`, `phone` | text | |
| `wants_more_of` | text | optional |
| `consent_text`, `consent_at` | text, timestamptz | |
| `ip_hash` | text | hashed, for limits only |
| `status` | text | queued, gathering, writing, review, ready, sent, failed, rejected, held |
| `fail_reason` | text | |
| `facts` | jsonb | §5.4 |
| `report` | jsonb | §7, Claude's draft |
| `report_final` | jsonb | after Gio's edits; what the page shows |
| `checks` | jsonb | which of §8's checks passed or failed |
| `model`, `prompt_version` | text | |
| `cost_tokens_in`, `cost_tokens_out` | int | for watching spend |
| `inquiry_id` | uuid | the `booking_inquiries` row it created |
| `sent_at`, `first_viewed_at` | timestamptz | |
| `view_count` | int | |

Row-level security: no public access. The Worker writes with the secret key,
and the lead app reads and edits as the signed-in user.

## 14. Endpoints (Worker)

| Method and path | Who | What |
|---|---|---|
| `POST /api/audit` | the form | validates, applies the guards, saves, starts the Workflow; returns `{ ok }` |
| `GET /api/audit/report/:reportId` | the report page | returns `report_final` plus the evidence values, only once sent; records a view |
| `POST /api/audit/:id/send` | the lead app (server side, `Authorization: Bearer AUDIT_ADMIN_TOKEN`) | sends a reviewed report |
| `POST /api/audit/:id/rerun` | the lead app (same auth) | gathers and writes again, e.g. after the site changed |

## 15. Configuration

| Name | Kind | Where |
|---|---|---|
| `ANTHROPIC_API_KEY` | secret | Worker |
| `GOOGLE_API_KEY` | secret | Worker (PageSpeed, and Places if on) |
| `RESEND_API_KEY` | secret | Worker |
| `TURNSTILE_SECRET` | secret | Worker; its site key is public, in the app |
| `AUDIT_ADMIN_TOKEN` | secret | Worker and lead app |
| `SUPABASE_SECRET_KEY` | secret | Worker (exists) |
| `AUDIT_AUTO_SEND` | var | `false` at launch |
| `AUDIT_DAILY_CAP` | var | `50` |
| `AUDIT_MODEL` | var | `claude-sonnet-5-5` |
| `AUDIT_PLACES` | var | `true` once Places billing is on |
| `AUDIT_WORKFLOW` | binding | Cloudflare Workflow |
| `AUDIT_LIMIT` | binding | rate limiter, like `ENQUIRY_LIMIT` |

## 16. Running costs (estimates, to confirm at build time)

| Item | Per audit | Monthly |
|---|---|---|
| Claude (Sonnet, ~20–40k tokens in, ~2–3k out) | a few pence | depends on volume; capped |
| PageSpeed Insights | free | free |
| Places API (one Text Search, top tier for rating and reviews) | free for the first ~1,000 a month, then ~$35 per 1,000 | likely £0 |
| Resend | free | free up to 3,000 emails |
| Cloudflare Workflows | — | may need the Workers paid plan (~$5) |
| Supabase | — | existing plan |

## 17. Measuring it

- **Audits requested** per week, and where from (the page, outreach, an area
  page).
- **Reports opened,** and how often.
- **Mockup clicks** from reports.
- **Audits that became leads, then won work** (the lead app's stages).
- **Review rate:** how many reports fail the checks. This tells us when
  auto-send is safe.

## 18. Testing the AI

- **Baselines:** NW Auto Wash and Elite Auto Care, already audited by hand
  (`~/Downloads/NW-Auto-Wash-Website-Audit.pdf`; Elite's findings are in
  §18 below). The automated report must reach the same
  main findings:
  - **NW:** slow on phones, nearby towns never mentioned, a name and address
    mismatch with its Google profile, page titles like "NW PPF 1".
  - **Elite:** a fast, well-built site; the gaps are local (no area or
    service pages); recommend Growth, not a rebuild.
- **Then about 10 more local sites** of different kinds (no site, Wix,
  WordPress, a fast custom site, a café, a trade). Each is checked by Gio for
  accuracy, tone and the right package.
- **Every audit stores its prompt version,** so prompt changes can be
  compared.

## 19. Open decisions

| Decision | Default in this spec |
|---|---|
| Review before sending, or automatic from day one | review first |
| Web report only, or a PDF too | web only |
| Include the Google Business Profile check (needs billing) | yes, once billing is on |
| Model | Sonnet 5.5, Opus as fallback |
| Daily cap | 50 |
| Phone number required or optional | required, as asked; watch whether it lowers sign-ups |

## 20. Risks

| Risk | Handling |
|---|---|
| The AI states something untrue | numbers come only from facts; mechanical checks; review switch |
| A website's text tries to steer the AI | marked untrusted; fixed output shape; no tools given to the model |
| Spam drives up cost | Turnstile, limits, daily cap, spend limit |
| Sites that block bots or are very slow | timeouts; the report says what couldn't be checked, or it goes to review |
| PageSpeed's quota | a Google API key raises it well above use |
| A report reads as salesy | the house rules put quick wins first and the offer last; tested on real sites |
