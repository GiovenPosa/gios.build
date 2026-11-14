// The three things every project is measured on, for the home page's
// "How we'll know" section.
export interface ResultLens {
  title: string;
  text: string;
  art: 'technical' | 'experience' | 'business';
  slot: string;
}

export const resultLenses: ResultLens[] = [
  {
    title: 'Built right.',
    text: 'Fast on every phone, easy for anyone to use, and every form tested before launch.',
    art: 'technical',
    slot: '#7cc4e4',
  },
  {
    title: 'Easy to use.',
    text: 'Fewer taps to get in touch, shorter forms, and nothing to figure out.',
    art: 'experience',
    slot: '#95fc9c',
  },
  {
    title: 'Brings work in.',
    text: 'Visits, enquiries and bookings, live on your own dashboard and reviewed with you.',
    art: 'business',
    slot: '#e1ead9',
  },
];

// How every site is built, and the specialist work on top: one card each on
// the home page (components/resultsLenses.tsx), extending the services above
// them ("Everything your website needs"). Each says why it matters to the
// business, then where to go next. The icon names a glyph in
// resultsLenses.tsx; `action` is where its link goes.
export type ServiceIcon = 'code' | 'design' | 'shopify' | 'accessibility' | 'hosting' | 'cms';

export interface ServiceDetail {
  title: string;
  text: string;
  icon: ServiceIcon;
  action:
    | { kind: 'link'; to: string; label: string }
    | { kind: 'enquiry'; label: string; message: string };
}

export const serviceDetails: ServiceDetail[] = [
  {
    title: 'Custom code',
    text: "No templates and no page builders. Every site is coded by hand, so the design can be exactly what your business needs, down to the smallest detail. It's faster too: nothing bloated, and no plugins to break or keep updating.",
    icon: 'code',
    action: { kind: 'link', to: '/work', label: 'See the work' },
  },
  {
    title: 'UI / UX design',
    text: 'Looking good is only the start. Every page is planned around what your customers came to do, so finding a price, booking a slot or getting in touch feels effortless, on a phone first.',
    icon: 'design',
    action: { kind: 'link', to: '/work/ossa-pilates', label: 'See a project' },
  },
  {
    title: 'Shopify',
    text: 'Selling online? Shopify takes care of payments, stock and orders. Your store gets a custom design that feels like your brand rather than another theme, and is set up to sell from day one.',
    icon: 'shopify',
    action: { kind: 'enquiry', label: 'Ask about Shopify', message: "I'd like to ask about a Shopify store." },
  },
  {
    title: 'Accessibility',
    text: 'A website should work for everyone: people using screen readers, keyboards, bigger text or older phones. Every site is built to the WCAG 2.2 AA standard and tested before launch.',
    icon: 'accessibility',
    action: { kind: 'link', to: '/website-audit', label: 'Check your site' },
  },
  {
    title: 'Managed hosting',
    text: "Fast, secure hosting, with your domain, security certificate, backups and updates all looked after. If something goes wrong, it gets fixed, without you ever needing to know what a DNS record is.",
    icon: 'hosting',
    action: { kind: 'enquiry', label: 'Ask about hosting', message: "I'd like to ask about hosting & care." },
  },
  {
    title: 'Content editing (CMS)',
    text: "Change your menu, prices, opening hours or photos yourself, from your phone. The editor is set up for just the parts you update, so the design can't break. Or send a message and it's done for you.",
    icon: 'cms',
    action: { kind: 'enquiry', label: 'Ask about editing', message: "I'd like to be able to update my site myself." },
  },
];
