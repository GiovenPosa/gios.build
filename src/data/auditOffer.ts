// What gios.build offers, as the audit's report writer is given it
// (docs/website-audit/spec.md §6): built from the site's own data, so the
// prices and contents in a report are always the ones on the Packages page.
//
// Plain data only: the Worker imports this.

import { packagesData, priceRange, type PackageId } from './packages';
import { servicesData } from './services';

export const AUDIT_OFFER = {
  business: 'gios.build: websites for small businesses, designed and built by Gio Posa in Bath, for clients across the UK.',
  freeMockup:
    'Every project starts with a free homepage mockup: the business sees what its new site could look like before paying anything, with no obligation.',
  seoNote:
    'SEO foundations come with every package (page titles, descriptions, fast pages, business data Google understands, Search Console). Growth adds local SEO: the Google Business Profile, a page per service or town, and a reviews plan.',
  packages: packagesData.map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    price: priceRange(pkg),
    for: pkg.for,
    includes: pkg.items,
    timeline: pkg.timeline,
  })),
  services: servicesData.map((service) => ({ name: service.title, includes: service.items })),
  hostingAndCare: 'Hosting, backups, security and small content updates, for a monthly fee quoted with the project.',
};

export const AUDIT_PACKAGE_IDS = packagesData.map((pkg) => pkg.id) as PackageId[];

/** every number the offer itself states (prices, weeks, days), which the
 *  report may quote */
export const offerNumbers = () =>
  [...JSON.stringify(AUDIT_OFFER).matchAll(/\d[\d,]*(?:\.\d+)?/g)].map((m) => Number(m[0].replace(/,/g, '')));
