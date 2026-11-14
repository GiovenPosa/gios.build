// The guides (pages/guides/): long answers to the questions small business
// owners search before they hire anyone. Each one's facts for search
// engines live here (its dates, its questions for the FAQ structured data);
// the article itself is its page.
//
// Every market figure in a guide is a typical range with its sources linked,
// and its "checked" date, since other providers' prices change.
//
// Plain data only: vite.config.ts reads this (through seo.ts and schema.ts).

import type { FaqItem } from './faq';
import type { PagePath } from './seo';

export interface Guide {
  path: Extract<PagePath, `/guides/${string}`>;
  /** the page's own headline (the Google title is in seo.ts) */
  headline: string;
  description: string;
  published: string;
  /** when its prices and facts were last checked */
  updated: string;
  minutes: number;
  faq: FaqItem[];
}

export const WEBSITE_COST_GUIDE: Guide = {
  path: '/guides/how-much-does-a-website-cost',
  headline: 'How much does a website cost for a small business in the UK?',
  description:
    'What you’ll pay in 2026, what changes the price, and the costs people forget. Written for small business owners, with a source for every figure.',
  published: '2026-11-14',
  updated: '2026-11-14',
  minutes: 8,
  faq: [
    {
      question: 'Is £500 enough for a website?',
      answer:
        'It can be, for a simple one-page site from a freelancer or a site you build yourself on Wix or Squarespace. At that price, expect a template rather than a design made for you, little help getting found on Google, and limited support. Ask exactly what’s included.',
    },
    {
      question: 'Why do agencies cost so much more than freelancers?',
      answer:
        'An agency has more people on your project (a project manager, designers, developers, sometimes a copywriter) and the overheads that come with them. For a large or complex site that team is worth paying for; for a small business site, a good freelancer often delivers the same result for less.',
    },
    {
      question: 'Do I pay VAT on a website?',
      answer:
        'Only if your web designer is VAT registered, which UK businesses must be once their taxable turnover passes £90,000 a year. If they are, 20% is added to the price, so always check whether a quote includes VAT.',
    },
    {
      question: 'Is a DIY website builder cheaper in the long run?',
      answer:
        'Usually not by as much as it looks. The monthly plan is cheap, but you pay for it every year, add your own time for the design, writing, photos and updates, and if you ever leave the builder you start again from scratch.',
    },
    {
      question: 'How long does a small business website take?',
      answer:
        'A simple site is often ready in a few weeks; bigger sites with bookings, shops or many pages take longer. At gios.build a simple website is usually live in about 4 weeks, and you’ll get a timeline with your quote.',
    },
  ],
};

export const GUIDES = [WEBSITE_COST_GUIDE];

export const guideByPath = (path: string) => GUIDES.find((guide) => guide.path === path);
