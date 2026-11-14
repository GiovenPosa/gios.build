// The area pages (pages/areaPage.tsx): one page per town, each with its own
// words. They speak to the business owner ("you"), never "I": what matters
// is what changes for them. They share a layout, but never copy each other's content: Google
// treats pages that only swap the town's name as spam, so each needs its own
// searches, its own findings and its own questions.
//
// Plain data only: vite.config.ts reads this (through seo.ts and schema.ts)
// for each page's head and structured data.

import type { FaqItem } from './faq';

export interface AreaFinding {
  /** the number or phrase, poster-sized */
  figure: string;
  /** what it means, in a sentence */
  text: string;
}

export interface Area {
  /** the page's path, e.g. "/web-design-trowbridge" */
  path: `/${string}`;
  town: string;
  /** the county or region around it, by its Wikipedia name */
  county: string;
  /** the town's Wikipedia page, so search engines know which one */
  wiki: string;
  /** the towns and villages around it, for the page and its structured data */
  nearby: string[];
  /** the hero (components/pageHero.tsx): each line's two halves, a sticker
   *  between them, and a full stop unless `stop` is false */
  hero: { lines: { left: string; right: string; stop?: boolean }[]; sub: string };
  /** the search section: two big lines, the grey ones, and the searches */
  search: { headline: string[]; lines: string[]; queries: string[] };
  /** the section only this town's page has: what's particular about its
   *  customers or its websites, each told as what it means for the business */
  findings: { headline: string[]; sub: string; items: AreaFinding[]; foot: string };
  packages: { headline: string[]; sub: string };
  faq: FaqItem[];
}

export const AREAS: Area[] = [
  {
    path: '/web-design-bath',
    town: 'Bath',
    county: 'Somerset',
    wiki: 'Bath,_Somerset',
    nearby: ['Keynsham', 'Bradford-on-Avon', 'Corsham', 'Radstock', 'Midsomer Norton'],
    hero: {
      lines: [
        { left: 'Websites', right: 'for Bath', stop: false },
        { left: 'made in', right: 'Bath' },
      ],
      sub: 'Built so locals and visitors find you, trust you and get in touch. Based in Bath, so meeting up is easy.',
    },
    search: {
      headline: ['Bath is busy.', 'Make sure they find you.'],
      lines: ['Locals, visitors and students', 'all search before they choose,', 'and go with whoever shows up.'],
      queries: [
        'café near me',
        'hairdresser Bath',
        'pilates Bath',
        'plumber Bath',
        'florist Bath',
        'things to do in Bath',
      ],
    },
    findings: {
      headline: ['Who’s searching', 'in Bath.'],
      sub: 'Customers in Bath come from three directions. A good website works for all of them.',
      items: [
        {
          figure: 'Visitors, a few streets away.',
          text: 'They’ve never heard of you. They search on their phone, standing nearby, and go wherever looks best right now. Hours and directions have to be one tap away.',
        },
        {
          figure: 'Locals who ask around first.',
          text: 'A friend recommends you, then they look you up. If the site looks tired or says little, the recommendation goes nowhere.',
        },
        {
          figure: 'New arrivals every September.',
          text: 'Two universities bring thousands of new people each year, all looking for their new café, gym and hairdresser. They start with a search.',
        },
      ],
      foot: 'Every gios.build site is built around how your customers actually search.',
    },
    packages: {
      headline: ['Simple prices.', 'SEO in every one.'],
      sub: 'Most Bath businesses start with Starter. To show up across Bath and the villages around it, Growth adds local SEO and your Google Business Profile.',
    },
    faq: [
      {
        question: 'Can we meet in person?',
        answer: 'Yes. gios.build is based in Bath, so meeting at your place or over a coffee in town is easy. A video call works too, whichever suits you.',
      },
      {
        question: 'Do you work outside the city centre?',
        answer: 'Yes: Larkhall, Widcombe, Oldfield Park, Combe Down and the rest of Bath, plus Keynsham, Bradford-on-Avon, Corsham, Radstock, Midsomer Norton and the villages in between.',
      },
      {
        question: 'Most of my customers are visitors. Does that change things?',
        answer: 'It changes what comes first. Visitors decide in seconds, often a few streets away, so your opening hours, where you are and how to get there need to be clear on a phone before anything else.',
      },
      {
        question: 'Will I show up when people nearby search?',
        answer: "Every site is built so Google can read it: clear titles, fast pages, and your business details in a form Google understands. To compete for searches like \"hairdresser Bath\", Growth adds local SEO: your Google Business Profile, a page for each service or area, and a plan for reviews.",
      },
      {
        question: 'How much does a website cost?',
        answer: "Starter sites are £600 to £900, redesigns £900 to £1,600, and Growth sites with local SEO start at £1,800. You'll get an exact price once we've talked, before anything is built.",
      },
      {
        question: 'Is the mockup really free?',
        answer: 'Yes, with no obligation. If you love it, the full site gets built. If not, no hard feelings.',
      },
    ],
  },
  {
    path: '/web-design-bristol',
    town: 'Bristol',
    county: 'West of England',
    wiki: 'Bristol',
    nearby: ['Keynsham', 'Portishead', 'Clevedon', 'Nailsea', 'Thornbury'],
    hero: {
      lines: [
        { left: 'Websites', right: 'for Bristol', stop: false },
        { left: 'businesses', right: 'that win work' },
      ],
      sub: 'Agency quality at small business prices, built so people nearby find you and get in touch. Half an hour from Bath, and happy to meet in person.',
    },
    search: {
      headline: ['Bristol is a big place.', 'Make sure they find you.'],
      lines: ['With so much choice nearby,', 'people search, compare,', 'and pick whoever looks best.'],
      queries: [
        'barber Bristol',
        'coffee Clifton',
        'plumber Bristol',
        'yoga Stokes Croft',
        'florist Bedminster',
        'personal trainer Bristol',
      ],
    },
    // Gio's own Bristol background, from the home page's story (data/journey.ts)
    findings: {
      headline: ['Why not', 'a big agency?'],
      sub: 'Bristol has no shortage of web agencies. For a small business, working with a studio of one has real advantages.',
      items: [
        {
          figure: 'The person you meet builds it.',
          text: 'No account managers and no hand-offs. The same person you talk to designs and builds your site, so nothing gets lost in between.',
        },
        {
          figure: 'Priced for small businesses.',
          text: 'Agency rates are set for bigger clients. Starter sites here begin at £600, with SEO foundations included in every package.',
        },
        {
          figure: 'Bristol trained, Bristol tested.',
          text: 'A Master’s in Computer Science at the University of Bristol, then almost two years as lead software engineer at Vanaways in Bristol.',
        },
      ],
      foot: 'All with a free homepage mockup first, so you see the quality before you spend a penny.',
    },
    packages: {
      headline: ['Simple prices.', 'SEO in every one.'],
      sub: 'Most Bristol businesses start with Starter. In a city this busy, Growth adds the local SEO and Google Business Profile that help you stand out nearby.',
    },
    faq: [
      {
        question: 'Can we meet in person?',
        answer: 'Yes. Bristol is half an hour from Bath, so meeting at your place or somewhere in town is easy. A video call works too, whichever suits you.',
      },
      {
        question: 'Which parts of Bristol do you work with?',
        answer: 'All of it: Clifton, Redland, Bedminster, Southville, Stokes Croft, Easton and the rest, plus Keynsham, Portishead, Clevedon, Nailsea and Thornbury.',
      },
      {
        question: 'Why not just use a Bristol agency?',
        answer: 'If you need a big team, an agency is a good choice. For most small businesses, working directly with the person who builds your site is quicker and costs less, and the free mockup shows you the quality before you commit.',
      },
      {
        question: 'Will I show up when people nearby search?',
        answer: "Every site is built so Google can read it: clear titles, fast pages, and your business details in a form Google understands. In a city as busy as Bristol, competing for searches like \"barber Bristol\" takes more, so Growth adds local SEO: your Google Business Profile, a page for each service or area, and a plan for reviews.",
      },
      {
        question: 'How much does a website cost?',
        answer: "Starter sites are £600 to £900, redesigns £900 to £1,600, and Growth sites with local SEO start at £1,800. You'll get an exact price once we've talked, before anything is built.",
      },
      {
        question: 'Is the mockup really free?',
        answer: 'Yes, with no obligation. If you love it, the full site gets built. If not, no hard feelings.',
      },
    ],
  },
  {
    path: '/web-design-trowbridge',
    town: 'Trowbridge',
    county: 'Wiltshire',
    wiki: 'Trowbridge',
    nearby: ['Bradford-on-Avon', 'Westbury', 'Melksham', 'Frome', 'Warminster'],
    hero: {
      lines: [
        { left: 'Websites', right: 'for', stop: false },
        { left: 'Trowbridge', right: 'businesses' },
      ],
      sub: 'Built so people nearby find you, trust you and get in touch. Based in Bath, half an hour away, and happy to meet in person.',
    },
    search: {
      headline: ['Your customers are already searching.', 'Make sure they find you.'],
      lines: ['When someone in Trowbridge needs you,', 'they search first,', 'and call whoever shows up.'],
      queries: [
        'plumber Trowbridge',
        'car detailing Trowbridge',
        'hairdresser near me',
        'café in Trowbridge',
        'electrician Wiltshire',
        'dog groomer Trowbridge',
      ],
    },
    // from audits of two Trowbridge-area websites in November 2026: one
    // site took 21.9s to become usable on a phone, never named the towns it
    // serves on any of its 26 pages, and had a different name and address on
    // its website and its Google profile
    findings: {
      headline: ['Why customers pick', 'someone else.'],
      sub: "Real problems from websites around Trowbridge. None of them look serious to the owner. All of them send customers to a competitor.",
      items: [
        {
          figure: 'They give up waiting.',
          text: 'One local site took over 20 seconds to open on a phone. Someone looking for help that day won’t wait. They go back and call the next business on the list.',
        },
        {
          figure: 'Nobody next door finds you.',
          text: 'One local business never named the towns around it, not once across its whole site. When someone in Westbury searches, Google shows them a business that did.',
        },
        {
          figure: 'They aren’t sure it’s you.',
          text: 'One business had a different name and address on its website than on Google. Customers wonder if they’ve found the right place, and Google is less sure too.',
        },
      ],
      foot: 'Every gios.build site fixes all three, whichever package you choose.',
    },
    packages: {
      headline: ['Simple prices.', 'SEO in every one.'],
      sub: 'Most local businesses start with Starter. To show up across Trowbridge and the towns around it, Growth adds local SEO and your Google Business Profile.',
    },
    faq: [
      {
        question: 'Do you come to Trowbridge?',
        answer: "Yes. Bath is about half an hour away, so meeting at your place or somewhere in town is easy. A video call works too, whichever suits you.",
      },
      {
        question: 'Do you work with businesses around Trowbridge?',
        answer: 'Yes: Bradford-on-Avon, Westbury, Melksham, Frome, Warminster and the villages around them. All close enough to meet in person.',
      },
      {
        question: 'Will I show up when people nearby search?',
        answer: "Every site is built so Google can read it: clear titles, fast pages, and your business details in a form Google understands. To compete for searches like \"plumber Trowbridge\", Growth adds local SEO: your Google Business Profile, a page for each service or town you cover, and a plan for reviews.",
      },
      {
        question: 'How much does a website cost?',
        answer: "Starter sites are £600 to £900, redesigns £900 to £1,600, and Growth sites with local SEO start at £1,800. You'll get an exact price once we've talked, before anything is built.",
      },
      {
        question: 'Is the mockup really free?',
        answer: 'Yes, with no obligation. If you love it, we build the full site. If not, no hard feelings.',
      },
      {
        question: 'How long does it take?',
        answer: "A simple website is usually live in about 4 weeks. Bigger or more bespoke sites take longer, and you'll get a timeline with your quote.",
      },
    ],
  },
];

export const areaByPath = (path: string) => AREAS.find((area) => area.path === path);
