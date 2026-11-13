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

// What gets tracked, one point per card. The icon names a glyph in
// resultsLenses.tsx.
export type TrackingIcon = 'dashboard' | 'speed' | 'review' | 'before' | 'enquiry' | 'dropoff';

export const trackingPoints: { text: string; icon: TrackingIcon }[] = [
  { text: 'Your own live dashboard, from the day the site goes live.', icon: 'dashboard' },
  { text: 'Visits and page speed, tracked on every page.', icon: 'speed' },
  { text: "A review together at 30 days, on what's working.", icon: 'review' },
  { text: "Your old site's numbers, measured first, so you can see the difference.", icon: 'before' },
  { text: 'Where every enquiry came from.', icon: 'enquiry' },
  { text: 'Where people drop off, and what we change to fix it.', icon: 'dropoff' },
];
