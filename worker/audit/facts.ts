// The facts an audit gathers about a website (docs/website-audit/spec.md §5):
// measured or read from the site, never written by AI. Saved to audits.facts,
// shown in the lead app, and (phase 3) handed to Claude to write the report.
//
// Every field is plain JSON, and kept small: a Workflow step's result has to
// fit in 1 MiB, and the whole thing goes into one database row.

export interface SpeedRun {
  /** Lighthouse category scores, 0 to 100 */
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  /** lab timings, in milliseconds */
  fcpMs: number | null;
  lcpMs: number | null;
  tbtMs: number | null;
  speedIndexMs: number | null;
  interactiveMs: number | null;
  cls: number | null;
  /** everything the page downloads, in KB */
  weightKb: number | null;
  /** real Chrome users over the last 28 days, when the site has enough visits */
  field: {
    overall: string | null;
    lcpMs: number | null;
    inpMs: number | null;
    cls: number | null;
  } | null;
}

export interface PageFacts {
  url: string;
  status: number;
  title: string | null;
  description: string | null;
  h1: string[];
  h2: string[];
  words: number;
  images: number;
  imagesMissingAlt: number;
  canonical: string | null;
  noindex: boolean;
  /** JSON-LD types on the page, e.g. ["LocalBusiness", "WebSite"] */
  schemaTypes: string[];
  /** the start of the page's text, for the report's writer (untrusted) */
  excerpt: string;
}

export interface BusinessData {
  name: string | null;
  telephone: string | null;
  address: string | null;
  locality: string | null;
  areaServed: string[];
  openingHours: boolean;
}

export interface SiteFacts {
  /** the address the audit was asked for, and where it ended up */
  url: string;
  finalUrl: string | null;
  https: boolean;
  /** whether http:// and the other host (www or not) send visitors on */
  redirects: { http: boolean | null; otherHost: boolean | null };
  robots: { found: boolean; blocksAll: boolean };
  sitemap: { found: boolean; urls: number };
  platform: string | null;
  pages: PageFacts[];
  /** places named across the pages read, and how often */
  places: Record<string, number>;
  phoneOnSite: string | null;
  emailOnSite: boolean;
  /** "unknown" when the site's builder adds forms with JavaScript (Wix,
   *  Squarespace, GoDaddy), which reading the HTML can't see */
  contactForm: 'yes' | 'no' | 'unknown';
  /** the site's contact page, if it links to one */
  contactPage: string | null;
  /** booking or ordering apps the site links to */
  bookingLinks: string[];
  socialLinks: string[];
  businessData: BusinessData | null;
  /** pages the site's robots.txt asked us not to read */
  skipped: number;
}

export interface ProfileFacts {
  found: boolean;
  name: string | null;
  address: string | null;
  phone: string | null;
  rating: number | null;
  reviews: number | null;
  category: string | null;
  website: string | null;
  nameMatches: boolean | null;
  addressMatches: boolean | null;
  phoneMatches: boolean | null;
}

export interface AuditFacts {
  url: string;
  domain: string;
  gatheredAt: string;
  speed: { mobile: SpeedRun | null; desktop: SpeedRun | null };
  /** Lighthouse's final screenshot of the home page on a phone (data URL) */
  screenshot: string | null;
  site: SiteFacts | null;
  profile: ProfileFacts | null;
  visitor: { wantsMoreOf: string | null };
  /** what couldn't be checked, and why, for the report's limits section */
  gaps: string[];
}
