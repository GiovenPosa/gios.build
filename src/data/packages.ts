// The three packages, for the Packages page price stack and quote builder.
// `id` matches the booking form's package options.
export type PackageId = 'starter' | 'redesign' | 'lead-system';

export interface PackageItem {
  id: PackageId;
  name: string;
  /** who it's for, in one line */
  for: string;
  /** the starting price, shown poster-sized */
  from: number;
  /** the top of the range; none for the open-ended tier */
  to?: number;
  /** what's in it, beyond the tier below */
  items: string[];
  timeline: string;
}

export const packagesData: PackageItem[] = [
  {
    id: 'starter',
    name: 'Starter',
    for: 'For new businesses that need to look professional online.',
    from: 600,
    to: 900,
    // SEO foundations are in every package: a site Google can't read isn't a
    // good website, whatever it costs (see the FAQ for foundations vs local SEO)
    items: ['One-page website', 'Mobile-friendly design', 'SEO foundations', 'Contact form to your inbox', 'Visit tracking & a 30-day review'],
    timeline: 'Live in about 4 weeks',
  },
  {
    id: 'redesign',
    name: 'Redesign',
    for: "For sites that look dated or don't bring in enquiries.",
    from: 900,
    to: 1600,
    // redirects from the old pages, so the redesign keeps its Google rankings
    items: ['A modern redesign of your site', 'Faster loading pages', 'Clearer messaging that sells', 'Keep your Google rankings'],
    timeline: 'Usually 4 to 6 weeks',
  },
  {
    id: 'lead-system',
    name: 'Growth',
    for: 'For businesses ready to make their website a source of leads.',
    from: 1800,
    items: ['Multiple pages', 'Bookings, maps & integrations', 'Detailed forms & enquiry tracking', 'Local SEO & Google Business Profile'],
    timeline: 'Typically 6 to 8 weeks',
  },
];

export const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

export const priceRange = (pkg: PackageItem) =>
  pkg.to ? `${formatPrice(pkg.from)} to ${formatPrice(pkg.to)}` : `${formatPrice(pkg.from)}+`;
