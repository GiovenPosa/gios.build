// Privacy-friendly analytics with Umami: totals only, no cookies, nothing
// that follows a person around. The tracker is served from this site's own
// /stats path (the Cloudflare Pages Functions in functions/stats pass it
// through to Umami Cloud), so ad blockers that block analytics domains leave
// it alone.
//
// It only runs on the live site (data-domains), respects Do Not Track, and
// stays off for anyone who opts out on the privacy page.

// From Umami: Settings > Websites > gios.build. Public, so fine to keep here.
const WEBSITE_ID = '118b6ab7-f683-4534-898a-0b986d659624';

// Umami's own switch for "don't count me": the tracker checks this key
const OPT_OUT_KEY = 'umami.disabled';

type EventData = Record<string, string | number | boolean>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: EventData) => void };
  }
}

export function isOptedOut(): boolean {
  try {
    return localStorage.getItem(OPT_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

export function setOptedOut(out: boolean) {
  try {
    if (out) localStorage.setItem(OPT_OUT_KEY, '1');
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // storage blocked: nothing to remember, and nothing is tracked either
  }
}

/** Adds the tracker once, on the live site. Page views (route changes
 *  included) are counted automatically from then on. */
export function initAnalytics() {
  if (!WEBSITE_ID || !import.meta.env.PROD || isOptedOut()) return;
  if (document.querySelector('script[data-website-id]')) return;
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/stats/s.js';
  script.dataset.websiteId = WEBSITE_ID;
  script.dataset.hostUrl = `${window.location.origin}/stats`;
  script.dataset.domains = 'gios.build,www.gios.build';
  script.dataset.doNotTrack = 'true';
  // real-visitor speed: load time, responsiveness, layout shift
  script.dataset.performance = 'true';
  document.head.appendChild(script);
}

/** Records a named action, e.g. track('Send enquiry', { package: 'starter' }).
 *  Does nothing if analytics is off, blocked or not loaded yet. */
export function track(event: string, data?: EventData) {
  try {
    window.umami?.track(event, data);
  } catch {
    // analytics must never break the site
  }
}
