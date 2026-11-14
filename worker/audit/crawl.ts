// Reading the website (spec §5.2): the home page, then up to 9 more pages
// from its sitemap (or the home page's own links), parsed with the Worker's
// HTMLRewriter. Only the same site; robots.txt is respected; every fetch is
// capped in size and time, and names itself as the gios.build audit.
//
// What it reads is the site's own words and code. Nothing here is trusted
// beyond counting and copying it into the facts (spec §6: the excerpts go to
// Claude marked as untrusted).

import type { BusinessData, PageFacts, SiteFacts } from './facts';

const AGENT = 'Mozilla/5.0 (compatible; gios.build-audit/1.0; +https://www.gios.build/website-audit)';
const MAX_PAGES = 10;
const MAX_BYTES = 1_500_000;
const FETCH_MS = 10_000;

// Towns around Bath, Bristol and Wiltshire, counted wherever they're named;
// the business's own town and areas (from its structured data) are added
// to these per site.
const LOCAL_PLACES = [
  'Bath', 'Bristol', 'Trowbridge', 'Westbury', 'Bradford-on-Avon', 'Bradford on Avon', 'Melksham', 'Frome',
  'Warminster', 'Chippenham', 'Corsham', 'Devizes', 'Keynsham', 'Radstock', 'Midsomer Norton', 'Wells',
  'Shepton Mallet', 'Swindon', 'Salisbury', 'Portishead', 'Clevedon', 'Nailsea', 'Thornbury', 'Weston-super-Mare',
  'Somerset', 'Wiltshire', 'Gloucestershire',
];

// booking and ordering apps, by the domain a "Book" or "Order" link goes to
const BOOKING = [
  'fresha', 'booksy', 'treatwell', 'mindbodyonline', 'glofox', 'teamup', 'opentable', 'resdiary', 'calendly',
  'square.site', 'squareup', 'setmore', 'simplybook', 'acuityscheduling', 'deliveroo', 'just-eat', 'ubereats',
  'checkatrade', 'bark.com', 'mybuilder', 'ratedpeople',
];
// form tools built into a page (in an iframe or a script)
const FORM_EMBEDS = /docs\.google\.com\/forms|forms\.gle|typeform\.com|jotform|tally\.so|hsforms|hubspot\.com\/forms|formspree\.io|calendly\.com|cognitoforms|wufoo/i;
// builders that add their forms with JavaScript, after the HTML arrives
const JS_FORM_PLATFORMS = ['Wix', 'Squarespace', 'GoDaddy', 'Weebly'];

const SOCIAL = ['instagram.com', 'facebook.com', 'tiktok.com', 'linkedin.com', 'x.com', 'twitter.com', 'youtube.com'];

const PLATFORMS: [string, RegExp][] = [
  ['Wix', /static\.wixstatic\.com|wix\.com|_wixCIDX/i],
  ['Squarespace', /static1\.squarespace\.com|squarespace/i],
  ['Shopify', /cdn\.shopify\.com|Shopify\.theme/i],
  ['WordPress', /wp-content|wp-includes/i],
  ['Webflow', /webflow\.(com|io)|data-wf-page/i],
  ['GoDaddy', /img1\.wsimg\.com|godaddy/i],
  ['Weebly', /weebly\.com/i],
  ['Next.js', /__NEXT_DATA__|\/_next\/static/i],
];

// HTML's character codes, as the characters they stand for
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  ndash: '–', mdash: '—', hellip: '…', pound: '£', copy: '©', reg: '®', trade: '™', eacute: 'é',
};
const decode = (text: string) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (match, name) => NAMED[name.toLowerCase()] ?? match);

/** text as people read it: codes decoded, invisible characters and runs of
 *  space taken out, and cut to a length */
const clean = (text: string, max = 300) =>
  decode(text).replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

async function get(url: string, redirect: RequestRedirect = 'follow') {
  return fetch(url, {
    redirect,
    headers: { 'User-Agent': AGENT, Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
    signal: AbortSignal.timeout(FETCH_MS),
  });
}

/** a page's body as text, cut at MAX_BYTES */
async function bodyText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    size += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const all = new Uint8Array(Math.min(size, MAX_BYTES));
  let at = 0;
  for (const chunk of chunks) {
    const part = chunk.subarray(0, Math.min(chunk.byteLength, all.length - at));
    all.set(part, at);
    at += part.byteLength;
    if (at >= all.length) break;
  }
  return new TextDecoder().decode(all);
}

/* ---------- robots.txt and the sitemap ---------- */

interface Robots {
  found: boolean;
  disallow: string[];
  sitemaps: string[];
}

async function readRobots(origin: string): Promise<Robots> {
  try {
    const response = await get(`${origin}/robots.txt`);
    if (!response.ok) return { found: false, disallow: [], sitemaps: [] };
    const text = (await bodyText(response)).slice(0, 100_000);
    const disallow: string[] = [];
    const sitemaps: string[] = [];
    let forUs = false;
    for (const raw of text.split('\n')) {
      const line = raw.replace(/#.*/, '').trim();
      const [field, ...rest] = line.split(':');
      const value = rest.join(':').trim();
      const name = field?.toLowerCase();
      if (name === 'user-agent') forUs = value === '*' || /gios/i.test(value);
      else if (name === 'disallow' && forUs && value) disallow.push(value);
      else if (name === 'sitemap' && value) sitemaps.push(value);
    }
    return { found: true, disallow, sitemaps };
  } catch {
    return { found: false, disallow: [], sitemaps: [] };
  }
}

/** whether robots.txt lets us read a path: each rule is a prefix, where "*"
 *  matches anything and a closing "$" means the path must end there */
const allowed = (robots: Robots, path: string) =>
  !robots.disallow.some((rule) => {
    // "$" is left as it is, so it already means "ends here"
    const pattern = rule.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    return new RegExp(`^${pattern}`).test(path);
  });

async function readSitemap(urls: string[], host: string): Promise<string[]> {
  for (const url of urls.slice(0, 3)) {
    try {
      const response = await get(url);
      if (!response.ok) continue;
      const xml = await bodyText(response);
      const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, '&'));
      // a sitemap index: read its first child sitemap
      if (/<sitemapindex/i.test(xml) && locs.length) return readSitemap(locs.slice(0, 2), host);
      const same = locs.filter((loc) => {
        try {
          return new URL(loc).hostname.replace(/^www\./, '') === host;
        } catch {
          return false;
        }
      });
      if (same.length) return same;
    } catch {
      // try the next
    }
  }
  return [];
}

/* ---------- one page ---------- */

interface PageRead extends PageFacts {
  links: string[];
  text: string;
  tel: string | null;
  mailto: boolean;
  form: boolean;
  ld: unknown[];
  raw: string;
}

async function readPage(url: string): Promise<PageRead> {
  const response = await get(url);
  const html = await bodyText(response);
  const page: PageRead = {
    url: response.url || url,
    status: response.status,
    title: null,
    description: null,
    h1: [],
    h2: [],
    words: 0,
    images: 0,
    imagesMissingAlt: 0,
    canonical: null,
    noindex: false,
    schemaTypes: [],
    excerpt: '',
    links: [],
    text: '',
    tel: null,
    mailto: false,
    form: false,
    ld: [],
    raw: html,
  };

  let title = '';
  let heading: { level: 'h1' | 'h2'; text: string } | null = null;
  let ldText = '';
  const rewriter = new HTMLRewriter()
    .on('title', { text: (t) => void (title += t.text) })
    .on('meta', {
      element: (el) => {
        const name = (el.getAttribute('name') ?? el.getAttribute('property') ?? '').toLowerCase();
        const content = el.getAttribute('content') ?? '';
        if (name === 'description' && !page.description) page.description = clean(content);
        if (name === 'robots' && /noindex/i.test(content)) page.noindex = true;
      },
    })
    .on('link[rel="canonical"]', { element: (el) => void (page.canonical = el.getAttribute('href')) })
    .on('h1, h2', {
      element: (el) => {
        heading = { level: el.tagName.toLowerCase() as 'h1' | 'h2', text: '' };
        el.onEndTag(() => {
          if (heading?.text.trim()) page[heading.level].push(clean(heading.text, 160));
          heading = null;
        });
      },
      text: (t) => {
        if (heading) heading.text += t.text;
      },
    })
    .on('img', {
      element: (el) => {
        page.images += 1;
        if (el.getAttribute('alt') === null) page.imagesMissingAlt += 1;
      },
    })
    .on('a[href]', {
      element: (el) => {
        const href = el.getAttribute('href') ?? '';
        if (href.startsWith('tel:') && !page.tel) page.tel = decodeURIComponent(href.slice(4)).trim();
        else if (href.startsWith('mailto:')) page.mailto = true;
        else page.links.push(href);
      },
    })
    .on('form', { element: () => void (page.form = true) })
    .on('script[type="application/ld+json"]', {
      element: () => {
        ldText = '';
      },
      text: (t) => {
        ldText += t.text;
        if (t.lastInTextNode) {
          try {
            page.ld.push(JSON.parse(ldText));
          } catch {
            // not valid JSON: nothing Google could use either
          }
          ldText = '';
        }
      },
    });
  await rewriter.transform(new Response(html, { headers: { 'Content-Type': 'text/html' } })).arrayBuffer();

  page.title = title.trim() ? clean(title, 200) : null;
  // the readable text: scripts, styles and tags taken out
  page.text = clean(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
    MAX_BYTES
  );
  page.words = page.text ? page.text.split(' ').length : 0;
  page.excerpt = page.text.slice(0, 700);
  page.schemaTypes = [...new Set(page.ld.flatMap(types))];
  return page;
}

/* ---------- structured data ---------- */

const graphOf = (node: unknown): Record<string, unknown>[] => {
  if (Array.isArray(node)) return node.flatMap(graphOf);
  if (!node || typeof node !== 'object') return [];
  const obj = node as Record<string, unknown>;
  return [obj, ...(Array.isArray(obj['@graph']) ? graphOf(obj['@graph']) : [])];
};
const types = (node: unknown) =>
  graphOf(node).flatMap((obj) => (Array.isArray(obj['@type']) ? obj['@type'] : obj['@type'] ? [obj['@type']] : [])).map(String);

const BUSINESS_TYPES = /LocalBusiness|Organization|Store|Restaurant|CafeOrCoffeeShop|Service|Salon|Shop|Dentist|AutoRepair|HealthClub|Plumber|Electrician|HomeAndConstructionBusiness|ProfessionalService/;

function businessFrom(ld: unknown[]): BusinessData | null {
  const node = ld.flatMap(graphOf).find((obj) => [obj['@type']].flat().some((t) => BUSINESS_TYPES.test(String(t))));
  if (!node) return null;
  const address = node.address as Record<string, unknown> | string | undefined;
  const addressText =
    typeof address === 'string'
      ? address
      : address
        ? [address.streetAddress, address.addressLocality, address.postalCode].filter(Boolean).join(', ')
        : null;
  const locality = typeof address === 'object' && address ? (address.addressLocality as string | undefined) ?? null : null;
  const areas = [node.areaServed].flat().filter(Boolean).map((area) => (typeof area === 'string' ? area : String((area as Record<string, unknown>).name ?? ''))).filter(Boolean);
  return {
    name: typeof node.name === 'string' ? clean(node.name, 120) : null,
    telephone: typeof node.telephone === 'string' ? node.telephone : null,
    address: addressText ? clean(addressText, 200) : null,
    locality,
    areaServed: areas.slice(0, 20),
    openingHours: Boolean(node.openingHours || node.openingHoursSpecification),
  };
}

/* ---------- the whole site ---------- */

/** checks whether a URL sends visitors on (a 3xx), without following it */
async function redirects(url: string) {
  try {
    const response = await get(url, 'manual');
    return response.status >= 300 && response.status < 400;
  } catch {
    return null;
  }
}

/** the home page, at the address given or, failing that, with "www."
 *  added or taken off (people type the bare domain; some sites only answer
 *  properly on one of the two) */
async function readHome(start: string): Promise<PageRead> {
  const url = new URL(start);
  const other = new URL(start);
  other.hostname = url.hostname.startsWith('www.') ? url.hostname.slice(4) : `www.${url.hostname}`;
  let first: unknown;
  for (const attempt of [url.toString(), other.toString()]) {
    try {
      const page = await readPage(attempt);
      if (page.status < 400) return page;
      first ??= new Error(`the home page answered ${page.status}`);
    } catch (error) {
      first ??= error;
    }
  }
  throw new Error(`reading the home page: ${first instanceof Error ? first.message : String(first)}`);
}

export async function readSite(start: string): Promise<SiteFacts> {
  const startUrl = new URL(start);
  const host = startUrl.hostname.replace(/^www\./, '');
  const home = await readHome(start);
  // robots.txt from wherever the home page really is
  const origin = new URL(home.url).origin;
  const robots = await readRobots(origin);
  const blocksAll = robots.disallow.includes('/');
  const finalOrigin = new URL(home.url).origin;

  // the other pages: from the sitemap, or failing that the home page's links
  const sitemapUrls = await readSitemap(robots.sitemaps.length ? robots.sitemaps : [`${finalOrigin}/sitemap.xml`], host);
  const fromLinks = home.links
    .map((href) => {
      try {
        return new URL(href, home.url);
      } catch {
        return null;
      }
    })
    .filter((u): u is URL => !!u && u.hostname.replace(/^www\./, '') === host && /^https?:$/.test(u.protocol))
    .map((u) => `${u.origin}${u.pathname}`);
  const homePath = new URL(home.url).pathname;
  const candidates = [...new Set([...sitemapUrls, ...fromLinks])]
    .filter((u) => {
      const path = new URL(u).pathname;
      return path !== homePath && !/\.(pdf|jpe?g|png|gif|webp|svg|zip|mp4|xml)$/i.test(path);
    })
    // the shallowest pages first: they're the main ones
    .sort((a, b) => new URL(a).pathname.split('/').length - new URL(b).pathname.split('/').length);

  let skipped = 0;
  const others: PageRead[] = [];
  for (const url of candidates) {
    if (others.length >= MAX_PAGES - 1) break;
    if (!allowed(robots, new URL(url).pathname)) {
      skipped += 1;
      continue;
    }
    try {
      const page = await readPage(url);
      if (page.status < 400 && new URL(page.url).hostname.replace(/^www\./, '') === host) others.push(page);
    } catch {
      // a page that won't load is left out
    }
  }
  const pages = [home, ...others];

  // the business's own details, from any page's structured data
  const businessData = businessFrom(pages.flatMap((page) => page.ld));

  // places named in the pages' text, the business's own included
  const placeNames = [...new Set([...LOCAL_PLACES, businessData?.locality, ...(businessData?.areaServed ?? [])].filter(Boolean) as string[])];
  const allText = pages.map((page) => page.text).join(' ');
  const places: Record<string, number> = {};
  for (const name of placeNames) {
    // a street named after a town ("Frome Road") isn't the town
    const pattern = new RegExp(`\\b${name.replace(/[-\s]/g, '[-\\s]')}\\b(?!\\s+(?:Road|Rd|Street|St|Lane|Ln|Way|Avenue|Ave|Close|Drive|Hill|Park|Industrial|Trading)\\b)`, 'gi');
    const count = allText.match(pattern)?.length ?? 0;
    if (count || name === businessData?.locality) places[name] = count;
  }

  const outbound = pages.flatMap((page) => page.links).filter((href) => /^https?:/i.test(href));
  const linkMatches = (list: string[]) =>
    [...new Set(list.filter((name) => outbound.some((href) => href.toLowerCase().includes(name))))];
  const phoneText = allText.match(/(?:\+44\s?7\d{3}|07\d{3})\s?\d{3}\s?\d{3}|(?:\+44\s?|0)1\d{2,4}\s?\d{3,4}\s?\d{3,4}/);
  const platform = PLATFORMS.find(([, pattern]) => pattern.test(home.raw))?.[0] ?? null;

  // a contact form: a real <form>, or a known form tool built in; when
  // there's neither on a builder that adds forms with JavaScript, it can't
  // be told from the HTML
  const formSeen = pages.some((page) => page.form || FORM_EMBEDS.test(page.raw));
  const contactForm: SiteFacts['contactForm'] = formSeen ? 'yes' : platform && JS_FORM_PLATFORMS.includes(platform) ? 'unknown' : 'no';
  const contactLink = [...new Set(pages.flatMap((page) => page.links))].find((href) => /contact|get-in-touch|enquir/i.test(href));
  let contactPage: string | null = null;
  try {
    contactPage = contactLink ? new URL(contactLink, home.url).toString() : null;
  } catch {
    contactPage = null;
  }

  const otherHost = startUrl.hostname.startsWith('www.') ? host : `www.${host}`;
  const [httpRedirects, otherHostRedirects] = await Promise.all([
    redirects(`http://${startUrl.hostname}/`),
    redirects(`https://${otherHost}/`),
  ]);

  return {
    url: start,
    finalUrl: home.url,
    https: home.url.startsWith('https:'),
    redirects: { http: httpRedirects, otherHost: otherHostRedirects },
    robots: { found: robots.found, blocksAll },
    sitemap: { found: sitemapUrls.length > 0, urls: sitemapUrls.length },
    platform,
    pages: pages.map(({ url, status, title, description, h1, h2, words, images, imagesMissingAlt, canonical, noindex, schemaTypes, excerpt }) => ({
      url, status, title, description, h1: h1.slice(0, 5), h2: h2.slice(0, 12), words, images, imagesMissingAlt, canonical, noindex, schemaTypes, excerpt,
    })),
    places,
    phoneOnSite: pages.find((page) => page.tel)?.tel ?? phoneText?.[0] ?? null,
    emailOnSite: pages.some((page) => page.mailto),
    contactForm,
    contactPage,
    bookingLinks: linkMatches(BOOKING),
    socialLinks: linkMatches(SOCIAL),
    businessData,
    skipped,
  };
}
