// The /ui page's content: the Gio UI component library's themes, components
// and developer FAQ. Nothing is for sale yet; the page collects a waitlist.
import type { FaqItem } from './faq';

// the library's themes (ui.gios.build), shown as the hero's theme pills
export type ThemeId = 'saas' | 'bold';

export const UI_THEMES: { id: ThemeId; label: string }[] = [
  { id: 'saas', label: 'SaaS' },
  { id: 'bold', label: 'Bold' },
];

/** shown in the hero; works from ui.gios.build once a project has REGISTRY_LINE in its components.json */
export const INSTALL_COMMAND = 'npx shadcn add @giosbuild/theme-saas @giosbuild/dropdown';

/** the line a project adds to the "registries" in its components.json */
export const REGISTRY_LINE = '"@giosbuild": "https://ui.gios.build/r/{name}.json"';

export type Tier = 'Free' | 'Pro';

// The first components, all from code already running on live sites. The
// order here is the grid's order; the id picks the live preview on its card
// (components/uiDemos.tsx). `soon` marks ones not in the library yet: their
// cards show "Coming soon" instead of a tier, and their previews are page
// stand-ins (components/uiKit/). Drop it once the component ships.
export const UI_COMPONENTS: { id: string; name: string; tier: Tier; blurb: string; soon?: true }[] = [
  { id: 'text-input', name: 'Text input', tier: 'Free', blurb: 'A labelled field with a two-layer focus ring and an error line.' },
  { id: 'dropdown', name: 'Dropdown', tier: 'Pro', blurb: 'A select that opens a listbox, with full keyboard support.' },
  { id: 'button', name: 'Button', tier: 'Free', blurb: 'The primary action: a pill in SaaS, a hard-shadow block in Bold.' },
  { id: 'chips', name: 'Chips', tier: 'Free', blurb: 'A quick single pick, as an accessible radio group.', soon: true },
  { id: 'accordion', name: 'Accordion', tier: 'Pro', blurb: 'Native details rows that glide open, one at a time.', soon: true },
  { id: 'text-area', name: 'Text area', tier: 'Free', blurb: 'The text input, grown for longer answers.' },
  { id: 'popover', name: 'Popover', tier: 'Pro', blurb: 'A panel that opens above or below, whichever fits.' },
  { id: 'cookie-banner', name: 'Cookie banner', tier: 'Pro', blurb: 'Accept or deny, remembered, and gone for good.' },
  { id: 'reveal', name: 'Reveal', tier: 'Free', blurb: 'Fades and un-blurs anything as it scrolls into view.', soon: true },
  { id: 'smart-header', name: 'Smart header', tier: 'Pro', blurb: 'Hides as you scroll down, back the moment you scroll up.', soon: true },
];

// Where each first component was built and proven, before the library
export const UI_ORIGINS = [
  {
    site: 'gios.build',
    kind: 'This site',
    components: ['Reveal', 'Field', 'Text input', 'Text area'],
  },
  {
    site: 'Prime Stock Central',
    kind: 'Client site',
    components: ['Field', 'Text input', 'Dropdown', 'Button', 'Chips', 'Popover', 'Accordion', 'Cookie banner', 'Smart header'],
  },
];

export const UI_FAQ: FaqItem[] = [
  {
    question: 'Do I need Tailwind?',
    answer: 'No. The components are styled with CSS Modules and CSS variables, so they drop into any React project, with or without Tailwind.',
  },
  {
    question: 'Can my client own the code?',
    answer: 'Yes. Components are copied into your project as plain files. At handover your client gets ordinary code, with no link to my registry or your account.',
  },
  {
    question: 'What happens if I stop paying?',
    answer: 'You keep everything you’ve already added, and your sites keep building. A licence key is only checked when you add a component, never when a site builds.',
  },
  {
    question: 'Does it work with Next.js?',
    answer: 'Yes. They’re written for plain React with no framework imports, so they work in Next.js, Vite and anything else that runs React.',
  },
  {
    question: 'JavaScript or TypeScript?',
    answer: 'Both. They’re written in TypeScript, and the shadcn CLI installs them as JavaScript in a JS project.',
  },
  {
    question: 'How do updates work?',
    answer: 'An update never changes a site on its own. Every file is stamped with its version, so you can re-add a component on a branch and keep what you want from the diff.',
  },
  {
    question: 'When does it launch?',
    answer: 'There’s no date yet. Join the waitlist and you’ll get one email when it does.',
  },
];
