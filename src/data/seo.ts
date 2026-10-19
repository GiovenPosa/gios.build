// Each page's title, description and link-preview text, in one place. The
// pages set these in the browser (components/pageMeta.tsx), and the build
// writes them into a copy of index.html for each page (vite.config.ts), so
// link previews (LinkedIn, WhatsApp, iMessage) and search engines see the
// right ones without running the app.
//
// Plain data only: vite.config.ts imports this file too.

export const SITE_URL = 'https://www.gios.build';

export interface PageSeo {
  /** the browser tab and search result title */
  title: string;
  /** the search result snippet */
  description: string;
  keywords?: string;
  /** shorter versions for link previews; default to the above */
  shareTitle?: string;
  shareDescription?: string;
}

export const PAGES = {
  '/': {
    title: 'gios.build | Websites for Small Businesses in Bath & Across the UK | Gio Posa',
    description:
      "I'm Gio, a web designer and software engineer in Bath. I build new websites and redesign old ones for small businesses across the UK, from £500, with a free homepage mockup before you commit.",
    keywords: 'web designer bath, web developer bath, small business website, website redesign, web design uk, gios.build',
    shareTitle: 'gios.build | Websites for Small Businesses',
    shareDescription: 'New websites and redesigns for small businesses, from £500. See a free mockup of your new homepage before you commit.',
  },
  '/work': {
    title: 'Work | gios.build | Websites & Software Built by Gio Posa',
    description:
      'Selected projects by Gio Posa: Van-Spec and a lead tracker for Vanaways, Staffly, CheckedIn, Orbital Intelligence, and an AI travel app built during an IBM internship.',
    keywords:
      'web design portfolio, ui ux portfolio, software engineering portfolio, digital product design, frontend development work, case studies, gios.build projects',
    shareTitle: 'Work | gios.build',
    shareDescription: 'Websites and software by Gio Posa: Van-Spec for Vanaways, Staffly, CheckedIn, Orbital Intelligence and more.',
  },
  '/packages': {
    title: 'Website Packages & Pricing for Small Businesses | gios.build',
    description:
      'Clear website pricing for small businesses: starter sites from £500, redesigns from £800 and growth websites from £1,500. Every project starts with a free homepage mockup.',
    keywords:
      'web design packages, website pricing uk, small business website, website redesign, lead generation website, web design services, landing page design, gios.build',
    shareTitle: 'Packages & Pricing | gios.build',
    shareDescription: 'Starter sites from £500, redesigns from £800, growth websites from £1,500. Every project starts with a free homepage mockup.',
  },
  '/privacy': {
    title: 'Privacy | gios.build',
    description:
      "How gios.build uses the details you send through the enquiry form: what's collected, why, where it's kept, for how long, and your rights.",
  },
} satisfies Record<string, PageSeo>;

export type PagePath = keyof typeof PAGES;
