// What people who have worked with Gio say. There are no paying clients
// yet, so these are endorsements from colleagues, collaborators and
// reviewers, each labelled with how the person knows Gio, so none reads as
// a client review. Swap in client words (and a `result`) once there are some.
//
// Before launch, check each person is happy with the exact words shown
// under their name (Jed's and Dalitso's started as suggested wording) and
// with their relationship line.
export interface Testimonial {
  quote: string;
  name: string;
  /** their role and where, as they've agreed it be shown */
  business: string;
  /** how they know Gio, so it's never mistaken for a client review */
  relationship: string;
  /** a measurable result: for real clients only */
  result?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    quote: 'Gio explained everything in plain English and never once made me feel silly.',
    name: 'Steph',
    business: 'Marketing Executive, Bath',
    relationship: 'Worked with Gio on a website project',
  },
  // Can he deliver? (a manager or tech lead)
  {
    quote: 'Give Gio a messy problem and he comes back with something clean that actually works.',
    name: 'Jed Williams',
    business: 'Head of Digital Growth, Bristol',
    relationship: 'Managed Gio at Vanaways',
  },
  // Will it look good? (a designer or marketer)
  {
    quote: 'He sweats the details most developers never notice. The spacing, the motion, all of it.',
    name: 'Dalitso Mwale',
    business: 'Founder, A Surgeon’s Journey, Cambridge',
    relationship: 'Reviewed Gio’s portfolio',
  },
];
