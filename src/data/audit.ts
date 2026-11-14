// The free website audit (pages/auditPage.tsx, worker/audit.ts; the whole
// feature is in docs/website-audit/spec.md). The page speaks to the business
// owner ("you"), never "I", like the area and industry pages.
//
// Plain data only: the Worker imports this too, for the consent wording it
// stores with each request.

import type { FaqItem } from './faq';

export const AUDIT_PATH = '/website-audit';

/** Cloudflare Turnstile's site key (public; its secret is the Worker's
 *  TURNSTILE_SECRET). Empty until the Turnstile site is set up: the form then
 *  goes without the check, and the Worker skips it too. */
export const TURNSTILE_SITE_KEY = '';

/** the tick box's words, stored with each request as the consent given */
export const AUDIT_CONSENT = 'Happy for gios.build to contact me about my audit.';

/** how long until the report arrives. Phase 1: the audits are put together
 *  by hand, so a working day; once they're automatic, minutes. */
export const AUDIT_TURNAROUND = 'within one working day';

// what the audit looks at, each told as what it means for the business
export const AUDIT_CHECKS = [
  {
    title: 'Fast on a phone?',
    text: 'How long your site takes to open on a phone, where most of your customers will see it first. Slow sites lose people before they’ve read a word.',
  },
  {
    title: 'Readable to Google?',
    text: 'Whether Google can tell what you do and where: your page titles, descriptions, headings and business details.',
  },
  {
    title: 'Found nearby?',
    text: 'Whether you show up for the towns you serve, and whether your website and your Google profile agree on who and where you are.',
  },
];

/** A real example: a Wiltshire detailing business audited in November 2026,
 *  with its name left out. The page shows it as a preview of a report. */
export const AUDIT_SAMPLE = {
  site: 'a car detailing business near Trowbridge',
  verdict: 'Great reviews, but a slow site that Google can’t place.',
  scorecards: [
    { area: 'Speed', rating: 'poor', detail: 'Phone score 51 out of 100' },
    { area: 'Google', rating: 'needs work', detail: 'Page titles that say neither what nor where' },
    { area: 'Local', rating: 'needs work', detail: 'Nearby towns named 0 times' },
  ],
  problems: [
    {
      title: 'Customers give up waiting.',
      text: 'The home page took over 20 seconds to become usable on a phone. Someone looking for a valet today will go back and pick the next result.',
    },
    {
      title: 'Nobody next door finds you.',
      text: 'Across 26 pages, the towns customers drive in from aren’t mentioned once, so Google has no reason to show the business to people searching there.',
    },
  ],
  quickWin: 'Make the business name on the website match the Google profile exactly. It takes five minutes and helps Google trust both.',
  help: 'A Redesign fixes the speed and the page titles, and keeps the Google rankings the site already has.',
} as const;

export const AUDIT_FAQ: FaqItem[] = [
  {
    question: 'Is it really free?',
    answer: 'Yes. No payment details, no obligation. You get the report either way, and it’s yours to use however you like, including with another designer.',
  },
  {
    question: 'What do you need from me?',
    answer: 'Just your website address, an email to send the report to, and a phone number in case a quick call is easier. Nothing to log in to and nothing to install.',
  },
  {
    question: 'What does the audit look at?',
    answer: 'Only what anyone can see: how fast your site loads on phones and computers, how Google reads it, and how you show up locally, including your Google Business Profile.',
  },
  {
    question: 'What happens after I get it?',
    answer: 'Nothing you don’t want. Read it, fix the quick wins yourself if you like. If you’d like help, there’s a free homepage mockup waiting, and a short call is always an option.',
  },
  {
    question: 'I don’t have a website yet. Can I still get one?',
    answer: 'There’s nothing to audit yet, but the free homepage mockup is made for exactly that. You’ll see what your site could look like before spending a penny.',
  },
  {
    question: 'Will you share my details?',
    answer: 'No. They’re only used to send your report and follow up about it. The privacy page explains exactly what’s kept and for how long.',
  },
];
