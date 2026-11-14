// A website audit's report (docs/website-audit/spec.md §7): what Claude
// writes from the facts (worker/audit/write.ts), what the checker vets
// (worker/audit/check.ts), and what the private report page shows
// (pages/reportPage.tsx).
//
// Plain data only: the Worker and the app both import this.

import type { PackageId } from './packages';

export type Rating = 'good' | 'needs work' | 'poor';

export interface AuditReport {
  business: { name: string; whatTheyDo: string; where: string; customers: string };
  /** one sentence: the headline finding, in the owner's terms */
  verdict: string;
  scorecards: { area: 'speed' | 'google' | 'local'; rating: Rating; summary: string }[];
  problems: {
    /** what it means for customers, e.g. "Customers give up waiting." */
    title: string;
    whatItCosts: string;
    /** the fact keys (factTable.ts) it rests on, or "screenshot" or "page.N.excerpt" */
    evidence: string[];
    fix: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  /** judgements from reading the site or seeing the screenshot, labelled as such */
  observations: string[];
  quickWins: { title: string; how: string }[];
  recommendation: { package: PackageId; why: string; includes: string[]; alsoConsider: string | null };
  /** a short, warm line leading to the free mockup */
  closing: string;
}

/** The tool Claude fills in, as JSON Schema: forcing it guarantees a
 *  report in exactly this shape. */
export const REPORT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['business', 'verdict', 'scorecards', 'problems', 'observations', 'quickWins', 'recommendation', 'closing'],
  properties: {
    business: {
      type: 'object',
      additionalProperties: false,
      required: ['name', 'whatTheyDo', 'where', 'customers'],
      properties: {
        name: { type: 'string', description: 'The business name, as it calls itself.' },
        whatTheyDo: { type: 'string', description: 'What it does, in one short phrase.' },
        where: { type: 'string', description: 'Where it is or serves, as the site says. "Not stated" if the site doesn’t say.' },
        customers: { type: 'string', description: 'Who its customers are, in one short phrase.' },
      },
    },
    verdict: { type: 'string', description: 'One sentence, under 20 words: the headline finding, in the owner’s terms.' },
    scorecards: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['area', 'rating', 'summary'],
        properties: {
          area: { type: 'string', enum: ['speed', 'google', 'local'] },
          rating: { type: 'string', enum: ['good', 'needs work', 'poor'] },
          summary: { type: 'string', description: 'Under 12 words, citing the key number if there is one.' },
        },
      },
    },
    problems: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'whatItCosts', 'evidence', 'fix', 'severity'],
        properties: {
          title: { type: 'string', description: 'What customers do or don’t do because of it, under 7 words, ending with a full stop. E.g. "Customers give up waiting."' },
          whatItCosts: { type: 'string', description: 'Two sentences at most: the plain fact, then what it costs the business.' },
          evidence: { type: 'array', minItems: 1, items: { type: 'string' }, description: 'Fact keys from the table, "screenshot", or "page.N.excerpt".' },
          fix: { type: 'string', description: 'What fixing it involves, in one sentence.' },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
      },
    },
    observations: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string' },
      description: 'Judgements from reading the pages or seeing the screenshot, each starting "From reading your site," or "From your home page on a phone,". No numbers.',
    },
    quickWins: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'how'],
        properties: {
          title: { type: 'string', description: 'Under 8 words.' },
          how: { type: 'string', description: 'What to do, in one or two sentences an owner could follow today.' },
        },
      },
    },
    recommendation: {
      type: 'object',
      additionalProperties: false,
      required: ['package', 'why', 'includes', 'alsoConsider'],
      properties: {
        package: { type: 'string', enum: ['starter', 'redesign', 'lead-system'] },
        why: { type: 'string', description: 'Two sentences: why this package fits these findings.' },
        includes: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' }, description: 'From the package’s own list, the parts that fix these problems.' },
        alsoConsider: { type: ['string', 'null'], description: 'Optional: one more thing from the offer worth mentioning, or null.' },
      },
    },
    closing: { type: 'string', description: 'One warm sentence leading to the free homepage mockup.' },
  },
} as const;
