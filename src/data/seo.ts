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

export const PAGES = {
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
  '/privacy': {
    title: 'Privacy | gios.build',
    description:
      "How gios.build uses the details you send through the enquiry form: what's collected, why, where it's kept, for how long, and your rights.",
    image: DEFAULT_IMAGE,
    imageAlt: "gios.build: Most websites blend in. Yours won't.",
    crumb: 'Privacy',
  },
} satisfies Record<string, PageSeo>;

export type PagePath = keyof typeof PAGES;
