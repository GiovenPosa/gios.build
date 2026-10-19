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
  /** the animated graphic in its slot, and the slot's colour */
  art: 'site' | 'redesign' | 'booking';
  slot: string;
}

export const packagesData: PackageItem[] = [
  {
    id: 'starter',
    name: 'Starter',
    for: 'For new businesses that need to look professional online.',
    from: 500,
    to: 800,
    items: ['One-page website', 'Mobile-friendly design', 'Contact form to your inbox'],
    timeline: 'Live in about 4 weeks',
    art: 'site',
    slot: '#7cc4e4',
  },
  {
    id: 'redesign',
    name: 'Redesign',
    for: "For sites that look dated or don't bring in enquiries.",
    from: 800,
    to: 1500,
    items: ['A modern redesign of your site', 'Faster loading pages', 'Clearer messaging that sells'],
    timeline: 'Usually 4 to 6 weeks',
    art: 'redesign',
    slot: '#95fc9c',
  },
  {
    id: 'lead-system',
    name: 'Growth',
    for: 'For businesses ready to make their website a source of leads.',
    from: 1500,
    items: ['Multiple pages', 'Bookings, maps & integrations', 'Detailed enquiry forms', 'SEO foundations & analytics'],
    timeline: 'Typically 6 to 8 weeks',
    art: 'booking',
    slot: '#e1ead9',
  },
];

export const formatPrice = (value: number) => `£${value.toLocaleString('en-GB')}`;

export const priceRange = (pkg: PackageItem) =>
  pkg.to ? `${formatPrice(pkg.from)} to ${formatPrice(pkg.to)}` : `${formatPrice(pkg.from)}+`;
