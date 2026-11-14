// The industry pages (pages/industryPage.tsx): one page per kind of
// business, for owners anywhere in the UK searching for a website made for
// what they do. Like the area pages they share a layout but never each
// other's words, and they speak to the owner ("you"), never "I".
//
// Each one leads with a real project of that kind (data/work.ts). Say what
// the site does, never that it won a client results: none of these are
// client results yet.
//
// Plain data only: vite.config.ts reads this (through seo.ts and schema.ts)
// for each page's head and structured data.

import type { FaqItem } from './faq';

export interface IndustryFeature {
  title: string;
  text: string;
  /** a phone screenshot from the project, by its key in FEATURE_SHOTS
   *  (pages/industryPage.tsx), e.g. "kape-menu" */
  shot: string;
}

export interface Industry {
  /** the page's path, e.g. "/websites-for-cafes" */
  path: `/${string}`;
  /** plural, lower case, for sentences: "cafés" */
  name: string;
  /** short, for the footer: "Cafés" */
  label: string;
  /** who the page is for, for its structured data */
  audience: string;
  /** the hero (components/pageHero.tsx): each line's two halves, a sticker
   *  between them, and a full stop unless `stop` is false */
  hero: { lines: { left: string; right: string; stop?: boolean }[]; sub: string };
  search: { headline: string[]; lines: string[]; queries: string[] };
  /** the project shown off, by its title in data/work.ts */
  project: { title: string; headline: string[]; text: string };
  features: { headline: string[]; sub: string; items: IndustryFeature[] };
  packages: { headline: string[]; sub: string };
  faq: FaqItem[];
}

export const INDUSTRIES: Industry[] = [
  {
    path: '/websites-for-cafes',
    name: 'cafés',
    label: 'Cafés',
    audience: 'Cafés, coffee shops, bakeries and brunch spots',
    hero: {
      lines: [
        { left: 'Websites', right: 'for cafés', stop: false },
        { left: 'that fill', right: 'tables' },
      ],
      sub: 'Your menu, your hours and how to find you, clear on every phone. See your free homepage mockup before you spend a penny.',
    },
    search: {
      headline: ['People pick a café on their phone.', 'Before they ever walk in.'],
      lines: ['They check the menu,', 'the hours and the photos,', 'then choose where to go.'],
      queries: [
        'coffee near me',
        'café open now',
        'brunch near me',
        'vegan café near me',
        'best flat white',
        'cake shop near me',
      ],
    },
    project: {
      title: 'Kape Coffee',
      headline: ['A café that feels like', 'home before you arrive.'],
      text: 'Kape Coffee is a Filipino coffee shop website: bold barako and ube lattes, merienda in the afternoons, and a menu you can read on any phone. Warm, illustrated and unhurried, like the café itself.',
    },
    features: {
      headline: ['What café customers', 'look for first.'],
      sub: 'Four things decide whether someone scrolling on their phone turns up at your door.',
      items: [
        {
          title: 'A feel for the place.',
          text: 'Your photos, your colours, your voice. People choose the café that already feels right before they’ve stepped inside.',
          shot: 'kape-hero',
        },
        {
          title: 'The menu, written out.',
          text: 'A photo of a paper menu is hard to read on a phone, and Google can barely read it. Written out, customers and Google both can.',
          shot: 'kape-menu',
        },
        {
          title: 'What’s new this week.',
          text: 'Specials and seasonal drinks give regulars a reason to come back, and your Instagram followers somewhere to land.',
          shot: 'kape-new',
        },
        {
          title: 'A reason to come later.',
          text: 'Afternoon menus, events and offers bring people in outside the morning rush, when the tables are empty.',
          shot: 'kape-afternoon',
        },
      ],
    },
    packages: {
      headline: ['Menu, hours and map', 'from £600.'],
      sub: 'Starter covers most cafés: your menu, opening hours, photos and a map. Want table bookings or online ordering built in? That’s Growth.',
    },
    faq: [
      {
        question: 'My menu changes all the time. Is that a problem?',
        answer: 'Not at all. The site keeps the things that rarely change, like your hours, location and regular dishes, and makes specials quick to update. Small changes are part of hosting & care, or the menu can be set up so you change it yourself.',
      },
      {
        question: "I'm on Deliveroo and Just Eat. Do I still need a website?",
        answer: 'The apps are great for reach, and a website sits alongside them. People who already know you can find your menu and book or order with you directly, so the app isn’t taking a cut on your regulars.',
      },
      {
        question: "Isn't Instagram enough?",
        answer: 'Instagram is brilliant for people who already follow you. Someone searching "coffee near me" won’t find your feed, but they will find a website with your menu, hours and address.',
      },
      {
        question: 'Can people book a table or order online?',
        answer: 'Yes. A "Book a table" or "Order" button can link to the booking or ordering app you already use, which keeps the price at Starter. Bookings and ordering built into the site itself are part of Growth.',
      },
      {
        question: 'How much does a café website cost?',
        answer: 'Most cafés need Starter, £600 to £900: menu, hours, photos and a map. Growth, from £1,800, adds bookings or ordering and local SEO. You’ll get an exact price before anything is built.',
      },
      {
        question: 'Is the mockup really free?',
        answer: 'Yes, with no obligation. If you love it, the full site gets built. If not, no hard feelings.',
      },
    ],
  },
  {
    path: '/websites-for-fitness-studios',
    name: 'fitness studios',
    label: 'Fitness studios',
    audience: 'Pilates and yoga studios, gyms, personal trainers and fitness classes',
    hero: {
      lines: [
        { left: 'Websites', right: 'for studios', stop: false },
        { left: 'that fill', right: 'classes' },
      ],
      sub: 'Your timetable, your prices and a Book button on every screen, so new members find you and book in. See your free homepage mockup first.',
    },
    search: {
      headline: ['New members start with a search.', 'Make sure they land on you.'],
      lines: ['They compare timetables,', 'prices and reviews,', 'then book wherever feels right.'],
      queries: [
        'pilates near me',
        'reformer pilates near me',
        'yoga classes near me',
        'personal trainer near me',
        'beginner pilates class',
        'boxing gym near me',
      ],
    },
    project: {
      title: 'Ossa Pilates',
      headline: ['Small classes,', 'told in a big way.'],
      text: 'Ossa Pilates is a boutique Pilates and yoga studio website: six reformers, small classes and seven ways to move. Editorial, warm and calm, with a Book button never more than a tap away.',
    },
    features: {
      headline: ['What new members', 'look for first.'],
      sub: 'Four things decide whether someone curious about a class actually books one.',
      items: [
        {
          title: 'A Book button, always.',
          text: 'Someone ready to try a class shouldn’t have to hunt for how. A Book button on every screen catches them the moment they decide.',
          shot: 'ossa-hero',
        },
        {
          title: 'A first class that feels easy.',
          text: 'Beginners worry they’ll be out of their depth. A page made for first-timers answers that before they have to ask.',
          shot: 'ossa-new',
        },
        {
          title: 'Why you, not the gym.',
          text: 'Small classes, personal attention, a calmer room: say what makes your studio different, in words people remember.',
          shot: 'ossa-seen',
        },
        {
          title: 'Proof from people like them.',
          text: 'Your Google reviews on your own site, so newcomers trust you without leaving to go and check.',
          shot: 'ossa-reviews',
        },
      ],
    },
    packages: {
      headline: ['Timetable, prices and booking', 'from £600.'],
      sub: 'Starter covers most studios, with a Book button into the app you already use, like Mindbody or Glofox. Want the timetable and booking built into the site? That’s Growth.',
    },
    faq: [
      {
        question: "I use Linktree. Isn't my link in bio enough?",
        answer: 'It works well for people who already follow you. Someone searching "pilates near me" never sees your Linktree. A website puts you in front of the people who don’t know you yet.',
      },
      {
        question: 'Can it link to Mindbody, Glofox or TeamUp?',
        answer: 'Yes. Your Book button can go straight into the app you already use, so nothing changes for your members. A timetable and booking built into the site itself are part of Growth.',
      },
      {
        question: 'I mostly coach online. Do I still need a website?',
        answer: 'Even more so. It’s how people who’ve never met you check you’re the real thing before they pay: your results, your packages and a clear way to sign up.',
      },
      {
        question: 'Can I show an intro offer?',
        answer: 'Yes, front and centre. A first-class offer or a free consultation is often what gets someone new through the door.',
      },
      {
        question: 'How much does a studio website cost?',
        answer: 'Most studios need Starter, £600 to £900: timetable, prices and a Book button into your booking app. Growth, from £1,800, adds booking built into the site and local SEO. You’ll get an exact price before anything is built.',
      },
      {
        question: 'Is the mockup really free?',
        answer: 'Yes, with no obligation. If you love it, the full site gets built. If not, no hard feelings.',
      },
    ],
  },
  {
    path: '/websites-for-local-services',
    name: 'local service businesses',
    label: 'Local services',
    audience: 'Cleaners, installers, maintenance, vending and other local service businesses',
    hero: {
      lines: [
        { left: 'Websites', right: 'that bring in', stop: false },
        { left: 'quote', right: 'requests' },
      ],
      sub: 'Say what you do, show where you cover, and make it easy to ask for a price. See your free homepage mockup before you spend a penny.',
    },
    search: {
      headline: ['Business customers search too.', 'Then they ask for quotes.'],
      lines: ['They shortlist two or three,', 'ask each for a price,', 'and go with whoever makes it easy.'],
      queries: [
        'office cleaning near me',
        'commercial cleaners Bath',
        'vending machine supplier',
        'window cleaner near me',
        'gardening services near me',
        'IT support for small business',
      ],
    },
    project: {
      title: 'Prime Stock Central',
      headline: ['A vending company', 'that looks premium.'],
      text: 'Prime Stock Central installs, stocks and looks after smart, cashless vending machines for workplaces in and around Bath. Bold colour, a 3D machine brought to life as you scroll, and a quote form waiting at the end.',
    },
    features: {
      headline: ['What business customers', 'look for first.'],
      sub: 'Four things decide whether someone comparing suppliers asks you for a price.',
      items: [
        {
          title: 'Get a quote, right up top.',
          text: 'Someone comparing three suppliers wants a price, fast. A Get a quote button on the first screen catches them before they move on.',
          shot: 'psc-hero',
        },
        {
          title: 'What you do, in one line.',
          text: 'Say plainly what you do and why it’s easier with you. Nobody reads a wall of text on a phone.',
          shot: 'psc-always-on',
        },
        {
          title: 'A reason to get in touch now.',
          text: 'A launch offer, limited spots or a seasonal deal gives people a reason to ask today, not someday.',
          shot: 'psc-founding',
        },
        {
          title: 'A form that’s easy to finish.',
          text: 'Ask only what’s needed to price the job, and say what happens next. The request lands in your inbox, ready to answer.',
          shot: 'psc-quote',
        },
      ],
    },
    packages: {
      headline: ['Services, areas and a quote form', 'from £600.'],
      sub: 'Starter covers most service businesses: what you do, where you cover and a quote form to your inbox. Want a page for each service or town, and local SEO to win them? That’s Growth.',
    },
    faq: [
      {
        question: 'My work comes from word of mouth. Do I need a website?',
        answer: 'Word of mouth is the best kind, and a website backs it up. When someone gets your name from a friend, the first thing they do is look you up. Your services, reviews and past work in one place make that call easy.',
      },
      {
        question: 'I already pay for leads on Checkatrade or Bark.',
        answer: 'A website works alongside them. Anyone who finds you through your own site contacts you directly, so you’re not paying for the lead or up against other businesses for the same job.',
      },
      {
        question: 'Can the quote form ask the questions I need?',
        answer: 'Yes. It asks what you need to price the job, like the type of work, the location or the size, and sends it straight to your inbox. Growth adds more detailed forms and enquiry tracking.',
      },
      {
        question: 'Can I have a page for each service or area?',
        answer: 'Yes, with Growth. A page for each service or town gives Google something specific to show, so you come up for searches like "office cleaning Bath", not just your name.',
      },
      {
        question: "I don't have time for this.",
        answer: 'Most of it is done for you: one conversation, a few photos of your work, and your thoughts on the mockup. That’s it.',
      },
      {
        question: 'How much does it cost?',
        answer: 'Most service businesses need Starter, £600 to £900: services, areas and a quote form. Growth, from £1,800, adds a page per service or area and local SEO. You’ll get an exact price before anything is built.',
      },
    ],
  },
];

export const industryByPath = (path: string) => INDUSTRIES.find((industry) => industry.path === path);
