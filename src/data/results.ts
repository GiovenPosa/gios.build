// The three things every project is measured on, for the home page's
// "How we'll know" section.
export interface ResultLens {
  layer: string;
  title: string;
  text: string;
  tracks: string[];
  art: 'technical' | 'experience' | 'business';
  slot: string;
}

export const resultLenses: ResultLens[] = [
  {
    layer: 'Technical',
    title: 'Built right.',
    text: 'Fast on every phone, easy for anyone to use, and every form tested before launch.',
    tracks: ['Speed', 'Accessibility', 'Forms'],
    art: 'technical',
    slot: '#7cc4e4',
  },
  {
    layer: 'Experience',
    title: 'Easy to use.',
    text: 'Fewer taps to get in touch, shorter forms, and nothing to figure out.',
    tracks: ['Taps to enquire', 'Form fields', 'Drop-offs'],
    art: 'experience',
    slot: '#95fc9c',
  },
  {
    layer: 'Business',
    title: 'Brings work in.',
    text: 'Visits, enquiries and bookings, live on your own dashboard and reviewed with you.',
    tracks: ['Visits', 'Enquiries', 'Sources'],
    art: 'business',
    slot: '#e1ead9',
  },
];

// The tracking each package adds on top of the one below it: one block
// each in the ladder, stacking up like the tier bars.
export const trackingLadder: { adds: string; detail: string }[] = [
  { adds: 'Visits & speed', detail: 'Your own live dashboard, and a review at 30 days' },
  { adds: 'Before & after', detail: "Your old site's numbers, measured first" },
  { adds: 'Every enquiry', detail: 'Where it came from, and where people drop off' },
];
