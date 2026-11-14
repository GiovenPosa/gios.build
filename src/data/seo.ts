// Each page's title, description and link-preview text, in one place. The
// pages set these in the browser (components/pageMeta.tsx), and the build
// writes them into a copy of index.html for each page (vite.config.ts), so
// link previews (LinkedIn, WhatsApp, iMessage) and search engines see the
// right ones without running the app. The build also writes the sitemap from
// this list, and each page's structured data (data/schema.ts).
//
// Titles stay under about 60 characters and descriptions under about 160,
// or Google cuts them off. Bath and Bristol lead (where most searches for a
// web designer nearby will come from), Somerset and Wiltshire follow, and
// "across the UK" keeps the door open everywhere else.
//
// Plain data only: vite.config.ts imports this file too.

import { workAbout, workPages, type WorkTitle } from './workAbout';

export const SITE_URL = 'https://www.gios.build';
export const SITE_NAME = 'gios.build';

export interface PageSeo {
  /** the browser tab and search result title */
  title: string;
  /** the search result snippet */
  description: string;
  keywords?: string;
  /** shorter versions for link previews; default to the above */
  shareTitle?: string;
  shareDescription?: string;
  /** the link-preview image, in public/og (2400 × 1260) */
  image: string;
  /** what the preview image shows, for screen readers */
  imageAlt: string;
  /** the page's name in the breadcrumb trail search results show */
  crumb: string;
}

export const DEFAULT_IMAGE = '/og/home.png';

const STATIC_PAGES = {
  '/': {
    title: 'Web Design in Bath & Bristol for Small Businesses | gios.build',
    description:
      'Websites for small businesses in Bath, Bristol, Somerset, Wiltshire and across the UK. Built to be found on Google, from £600, with a free homepage mockup.',
    keywords:
      'web designer bath, web design bath, web designer bristol, web design bristol, web designer trowbridge, web design somerset, web design wiltshire, small business website, website redesign, local seo, web design uk, gios.build',
    shareTitle: 'gios.build | Websites for Small Businesses',
    shareDescription: "Most websites blend in. Yours won't. New websites and redesigns from £600, with a free homepage mockup first.",
    image: '/og/home.png',
    imageAlt: "gios.build: Most websites blend in. Yours won't. Websites for small businesses in Bath, Bristol and across the UK, from £600.",
    crumb: 'Home',
  },
  '/work': {
    title: 'Website Design Portfolio | Web Designer in Bath | gios.build',
    description:
      'Recent websites by Gio Posa, a web designer in Bath: Prime Stock Central, Ossa Pilates and Kape Coffee. Fast, mobile-first sites made to bring in work.',
    keywords:
      'web design portfolio, website examples, small business websites, web designer bath, web designer bristol, next.js websites, gios.build work',
    shareTitle: 'Work | gios.build',
    shareDescription: 'Recent websites by Gio Posa: Prime Stock Central, Ossa Pilates and Kape Coffee.',
    image: '/og/work.jpg',
    imageAlt: 'Recent websites by gios.build: Prime Stock Central, Ossa Pilates and Kape Coffee.',
    crumb: 'Work',
  },
  '/packages': {
    title: 'Website Prices for Small Businesses | From £600 | gios.build',
    description:
      'Clear website prices: Starter from £600, Redesign from £900, and Growth with local SEO from £1,800. SEO foundations and a free homepage mockup with every site.',
    keywords:
      'website prices uk, how much does a website cost, small business website cost, web design packages, website redesign cost, local seo, web design bath prices, gios.build',
    shareTitle: 'Packages & Prices | gios.build',
    shareDescription: 'Starter from £600, Redesign from £900, Growth from £1,800. SEO foundations and a free homepage mockup with every site.',
    image: '/og/packages.png',
    imageAlt: 'gios.build website packages: Starter from £600, Redesign from £900, Growth from £1,800.',
    crumb: 'Packages',
  },
  '/ui': {
    title: 'Gio UI | A React Component Library You Own | gios.build',
    description:
      'Gio UI is a copy-in React component library: pull components into your project, theme them with CSS variables, and hand plain code to your client. Join the waitlist.',
    keywords: 'react component library, copy-in components, shadcn registry, css modules components, react ui kit, design system, gios.build',
    shareTitle: 'Gio UI | Copy it in. Make it yours.',
    shareDescription: 'A React component library you copy into your project, theme with CSS variables and hand over as plain code.',
    image: '/og/ui.png',
    imageAlt: 'Gio UI: a React component library you copy into your project and make your own.',
    crumb: 'Gio UI',
  },
  // the free website audit (docs/website-audit/spec.md)
  '/website-audit': {
    title: 'Free Website Audit for Small Businesses | gios.build',
    description:
      'What’s costing you customers? Your site’s speed, Google and local search, checked and explained in plain English. Free for UK small businesses.',
    keywords:
      'free website audit, website audit uk, website check, seo audit small business, why is my website not on google, website speed test, local seo audit, gios.build',
    shareTitle: 'Free website audit | gios.build',
    shareDescription: 'Is your website costing you customers? A free audit of its speed, Google and local search, in plain English.',
    image: '/og/audit.png',
    imageAlt: 'gios.build: Is your website costing you customers? A free website audit.',
    crumb: 'Free website audit',
  },
  // the area pages (data/areas.ts)
  '/web-design-bath': {
    title: 'Web Designer in Bath, Somerset | gios.build',
    description:
      'Websites for Bath businesses, built so locals and visitors find you on Google. From £600, with a free homepage mockup first. Based in Bath, happy to meet.',
    keywords:
      'web designer bath, web design bath, website design bath, bath web designer, small business website bath, local seo bath, web design somerset, gios.build',
    shareTitle: 'Websites for Bath, made in Bath | gios.build',
    shareDescription: 'Built so locals and visitors find you, trust you and get in touch. From £600, with a free homepage mockup first.',
    image: '/og/bath.png',
    imageAlt: 'gios.build: Websites for Bath, made in Bath. From £600, with a free homepage mockup first.',
    crumb: 'Web design in Bath',
  },
  '/web-design-bristol': {
    title: 'Web Designer in Bristol | Small Business Websites | gios.build',
    description:
      'Websites for Bristol businesses: agency quality at small business prices, built to be found on Google. From £600, with a free homepage mockup first.',
    keywords:
      'web designer bristol, web design bristol, website design bristol, freelance web designer bristol, small business website bristol, local seo bristol, gios.build',
    shareTitle: 'Websites for Bristol businesses | gios.build',
    shareDescription: 'Agency quality at small business prices. From £600, with a free homepage mockup first.',
    image: '/og/bristol.png',
    imageAlt: 'gios.build: Websites for Bristol businesses that win work. From £600, with a free homepage mockup first.',
    crumb: 'Web design in Bristol',
  },
  '/web-design-trowbridge': {
    title: 'Web Designer in Trowbridge, Wiltshire | gios.build',
    description:
      'Websites for Trowbridge businesses, built to be found on Google. From £600, with a free homepage mockup first. Based in Bath and happy to meet in person.',
    keywords:
      'web designer trowbridge, web design trowbridge, website design wiltshire, web designer wiltshire, small business website trowbridge, local seo trowbridge, gios.build',
    shareTitle: 'Websites for Trowbridge businesses | gios.build',
    shareDescription: 'Built so people nearby find you, trust you and get in touch. From £600, with a free homepage mockup first.',
    image: '/og/trowbridge.png',
    imageAlt: 'gios.build: Websites for Trowbridge businesses. From £600, with a free homepage mockup first.',
    crumb: 'Web design in Trowbridge',
  },
  // the industry pages (data/industries.ts)
  '/websites-for-cafes': {
    title: 'Websites for Cafés & Coffee Shops | gios.build',
    description:
      'Café websites with your menu, hours and photos clear on every phone, built to be found on Google. From £600, with a free homepage mockup first.',
    keywords:
      'cafe website, coffee shop website, website for cafe, cafe website design, restaurant website uk, small cafe website, cafe menu website, gios.build',
    shareTitle: 'Websites for cafés that fill tables | gios.build',
    shareDescription: 'Your menu, your hours and how to find you, clear on every phone. From £600, with a free homepage mockup first.',
    image: '/og/cafes.jpg',
    imageAlt: 'gios.build: Websites for cafés that fill tables. The Kape Coffee website on a phone.',
    crumb: 'Websites for cafés',
  },
  '/websites-for-fitness-studios': {
    title: 'Websites for Fitness, Pilates & Yoga Studios | gios.build',
    description:
      'Studio websites with your timetable, prices and a Book button on every screen, built to be found on Google. From £600, with a free homepage mockup first.',
    keywords:
      'fitness studio website, pilates studio website, yoga studio website, gym website design, personal trainer website, website for fitness business uk, gios.build',
    shareTitle: 'Websites for studios that fill classes | gios.build',
    shareDescription: 'Your timetable, your prices and a Book button on every screen. From £600, with a free homepage mockup first.',
    image: '/og/fitness.jpg',
    imageAlt: 'gios.build: Websites for studios that fill classes. The Ossa Pilates website on a phone.',
    crumb: 'Websites for fitness studios',
  },
  '/websites-for-local-services': {
    title: 'Websites for Local Service Businesses | gios.build',
    description:
      'Websites for cleaners, installers and local service businesses, built to bring in quote requests and be found on Google. From £600, free mockup first.',
    keywords:
      'service business website, cleaning company website, website for tradesmen, quote request website, b2b website small business, local service website uk, gios.build',
    shareTitle: 'Websites that bring in quote requests | gios.build',
    shareDescription: 'Say what you do, show where you cover, and make it easy to ask for a price. From £600, with a free homepage mockup first.',
    image: '/og/local-services.jpg',
    imageAlt: 'gios.build: Websites that bring in quote requests. The Prime Stock Central website on a phone.',
    crumb: 'Websites for local services',
  },
  '/privacy': {
    title: 'Privacy | gios.build',
    description:
      "How gios.build uses the details you send through the enquiry form: what's collected, why, where it's kept, for how long, and your rights.",
    image: DEFAULT_IMAGE,
    imageAlt: "gios.build: Most websites blend in. Yours won't.",
    crumb: 'Privacy',
  },
} satisfies Record<string, PageSeo>;

/** each project's page (data/workAbout.ts), at /work/<slug> */
export type WorkPagePath = `/work/${string}`;
const WORK_PAGES = Object.fromEntries(
  (Object.keys(workPages) as WorkTitle[]).map((title) => {
    const page = workPages[title];
    const seo: PageSeo = {
      title: page.title,
      description: page.description,
      keywords: `${title.toLowerCase()} website, ${workAbout[title].facts[0].values[0].toLowerCase()} website design, web design portfolio, gios.build`,
      shareTitle: `${title} | gios.build`,
      shareDescription: workAbout[title].summary,
      image: page.image,
      imageAlt: `The ${title} website, designed and built by gios.build.`,
      crumb: title,
    };
    return [`/work/${page.slug}`, seo];
  })
) as Record<WorkPagePath, PageSeo>;

export type PagePath = keyof typeof STATIC_PAGES | WorkPagePath;

/** every page: the site's own, then each project's */
export const PAGES: Record<PagePath, PageSeo> = { ...STATIC_PAGES, ...WORK_PAGES };
