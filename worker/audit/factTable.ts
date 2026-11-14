// The facts as a table the report writer reads and cites (spec §6–8): one
// row per fact, each with a key the report's evidence points at, a plain
// label, and the value written the way a report would say it (seconds, not
// milliseconds; MB, not bytes). The checker (check.ts) allows only these
// values, and the offer's own prices, as numbers in the report.

import type { AuditFacts, SpeedRun } from './facts';

export interface FactRow {
  key: string;
  label: string;
  /** as the report should write it: a number, or a few words */
  value: string | number | boolean;
}

const secs = (ms: number | null) => (ms === null ? null : Math.round(ms / 100) / 10);
const mb = (kb: number | null) => (kb === null ? null : Math.round(kb / 102.4) / 10);

function speedRows(rows: FactRow[], device: 'mobile' | 'desktop', run: SpeedRun | null) {
  const on = device === 'mobile' ? 'on a phone' : 'on a computer';
  if (!run) return;
  const add = (key: string, label: string, value: number | string | null) => {
    if (value !== null) rows.push({ key: `speed.${device}.${key}`, label, value });
  };
  add('performance', `Google speed score ${on}, out of 100`, run.performance);
  add('seo', `Google's SEO check score ${on}, out of 100`, run.seo);
  add('accessibility', `Accessibility score ${on}, out of 100`, run.accessibility);
  add('fcpSeconds', `Seconds until anything shows ${on}`, secs(run.fcpMs));
  add('lcpSeconds', `Seconds until the main content shows ${on}`, secs(run.lcpMs));
  add('interactiveSeconds', `Seconds until the page can be used ${on}`, secs(run.interactiveMs));
  add('blockingSeconds', `Seconds the page is frozen while loading ${on}`, secs(run.tbtMs));
  add('weightMb', `Size of the page in MB ${on}`, mb(run.weightKb));
  if (run.field) {
    add('field.overall', `Real visitors' experience ${on} (Google's Chrome data)`, run.field.overall?.toLowerCase() ?? null);
    add('field.lcpSeconds', `Seconds until the main content shows for real visitors ${on}`, secs(run.field.lcpMs));
  }
}

/** the facts, as rows */
export function factTable(facts: AuditFacts): FactRow[] {
  const rows: FactRow[] = [];
  speedRows(rows, 'mobile', facts.speed.mobile);
  speedRows(rows, 'desktop', facts.speed.desktop);

  const site = facts.site;
  if (site) {
    const pages = site.pages;
    rows.push(
      { key: 'site.platform', label: 'What the site is built with', value: site.platform ?? 'not obvious' },
      { key: 'site.https', label: 'Uses a secure (https) address', value: site.https },
      { key: 'site.redirects.http', label: 'The http:// address sends visitors to the secure one', value: site.redirects.http ?? 'unknown' },
      { key: 'site.redirects.otherHost', label: 'The address with or without www sends visitors to the main one', value: site.redirects.otherHost ?? 'unknown' },
      { key: 'site.sitemap', label: 'Has a sitemap for Google', value: site.sitemap.found },
      { key: 'site.pagesRead', label: 'Pages read for this audit', value: pages.length },
      { key: 'site.pagesWithoutDescription', label: 'Pages read with no Google description', value: pages.filter((p) => !p.description).length },
      { key: 'site.pagesUnder150Words', label: 'Pages read with fewer than 150 words', value: pages.filter((p) => p.words < 150).length },
      { key: 'site.imagesMissingAlt', label: 'Images with no description, across the pages read', value: pages.reduce((n, p) => n + p.imagesMissingAlt, 0) },
      { key: 'site.noindexPages', label: 'Pages telling Google not to list them', value: pages.filter((p) => p.noindex).length },
      { key: 'site.phoneOnSite', label: 'Phone number shown on the site', value: site.phoneOnSite ?? 'none found' },
      { key: 'site.contactForm', label: 'Contact form', value: site.contactForm === 'unknown' ? `can't tell: ${site.platform} adds forms after the page loads` : site.contactForm },
      { key: 'site.contactPage', label: 'Has a contact page', value: Boolean(site.contactPage) },
      { key: 'site.bookingLinks', label: 'Booking or ordering apps linked', value: site.bookingLinks.join(', ') || 'none' },
      { key: 'site.socialLinks', label: 'Social media linked', value: site.socialLinks.join(', ') || 'none' },
      { key: 'site.businessData', label: 'Gives Google its business details (structured data)', value: Boolean(site.businessData) }
    );
    if (site.businessData) {
      rows.push(
        { key: 'site.businessData.name', label: 'Business name, as the site tells Google', value: site.businessData.name ?? 'none' },
        { key: 'site.businessData.address', label: 'Address, as the site tells Google', value: site.businessData.address ?? 'none' },
        { key: 'site.businessData.openingHours', label: 'Gives Google its opening hours', value: site.businessData.openingHours }
      );
    }
    for (const [place, count] of Object.entries(site.places)) {
      rows.push({ key: `site.places.${place}`, label: `Times "${place}" is named across the pages read`, value: count });
    }
    pages.forEach((page, index) => {
      const path = new URL(page.url).pathname;
      rows.push(
        { key: `page.${index}.title`, label: `Google title of ${path}`, value: page.title ?? 'none' },
        { key: `page.${index}.h1`, label: `Main heading of ${path}`, value: page.h1[0] ?? 'none' },
        { key: `page.${index}.words`, label: `Words on ${path}`, value: page.words }
      );
    });
  }

  const profile = facts.profile;
  if (profile?.found) {
    rows.push(
      { key: 'profile.name', label: 'Business name on its Google profile', value: profile.name ?? 'none' },
      { key: 'profile.rating', label: 'Google rating, out of 5', value: profile.rating ?? 'none' },
      { key: 'profile.reviews', label: 'Number of Google reviews', value: profile.reviews ?? 0 },
      { key: 'profile.category', label: 'Category on its Google profile', value: profile.category ?? 'none' },
      { key: 'profile.nameMatches', label: 'Google profile name matches the site', value: profile.nameMatches ?? 'unknown' },
      { key: 'profile.addressMatches', label: 'Google profile address matches the site', value: profile.addressMatches ?? 'unknown' },
      { key: 'profile.phoneMatches', label: 'Google profile phone matches the site', value: profile.phoneMatches ?? 'unknown' }
    );
  } else if (profile && !profile.found) {
    rows.push({ key: 'profile.found', label: 'A Google Business Profile linking to this site was found', value: false });
  }
  return rows;
}

/** the table as lines for the prompt: key | label | value */
export const factLines = (rows: FactRow[]) => rows.map((row) => `${row.key} | ${row.label} | ${row.value}`).join('\n');
