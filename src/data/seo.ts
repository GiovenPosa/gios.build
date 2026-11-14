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
      "I'm Gio, a web designer and software engineer in Bath. I build new websites and redesign old ones for small businesses across the UK, from £600, built to be found on Google, with a free homepage mockup before you commit.",
    keywords: 'web designer bath, web developer bath, small business website, website redesign, web design uk, gios.build',
    shareTitle: 'gios.build | Websites for Small Businesses',
    shareDescription: 'New websites and redesigns for small businesses, from £600. See a free mockup of your new homepage before you commit.',
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
      'Clear website pricing for small businesses: starter sites from £600, redesigns from £900 and growth websites with local SEO from £1,800. SEO foundations and a free homepage mockup with every project.',
    keywords:
      'web design packages, website pricing uk, small business website, website redesign, lead generation website, web design services, landing page design, gios.build',
    shareTitle: 'Packages & Pricing | gios.build',
    shareDescription: 'Starter sites from £600, redesigns from £900, growth websites from £1,800. SEO foundations and a free homepage mockup with every project.',
  },
  '/ui': {
    title: 'Gio UI | A React Component Library You Own | gios.build',
    description:
      'Gio UI is a copy-in React component library: pull components into your project, theme them with CSS variables, and hand plain code to your client. Join the waitlist.',
    keywords: 'react component library, copy-in components, shadcn registry, css modules components, react ui kit, design system, gios.build',
    shareTitle: 'Gio UI | Copy it in. Make it yours.',
    shareDescription: 'A React component library you copy into your project, theme with CSS variables and hand over as plain code.',
  },
  '/privacy': {
    title: 'Privacy | gios.build',
    description:
      "How gios.build uses the details you send through the enquiry form: what's collected, why, where it's kept, for how long, and your rights.",
  },
} satisfies Record<string, PageSeo>;

export type PagePath = keyof typeof PAGES;
