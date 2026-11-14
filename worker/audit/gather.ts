// Putting an audit's facts together (spec §5): the site, its speed and its
// Google profile, each gathered separately (the Workflow runs them as their
// own steps, so each retries on its own), then combined here.

import type { AuditFacts, ProfileFacts, SiteFacts, SpeedRun } from './facts';

export interface GatherEnv {
  /** Google API key for PageSpeed Insights (and Places, once it's on) */
  GOOGLE_API_KEY?: string;
  /** "true" once Places billing is on in Google Cloud */
  AUDIT_PLACES?: string;
}

/** what to search Google Maps for: the business's name and town as the
 *  site gives them, else its home page title */
export function profileQuery(site: SiteFacts) {
  const business = site.businessData;
  const name = business?.name ?? site.pages[0]?.title?.split(/\s[|–—-]\s/)[0] ?? null;
  if (!name) return null;
  return [name, business?.locality].filter(Boolean).join(' ');
}

export function assemble(parts: {
  url: string;
  domain: string;
  wantsMoreOf: string | null;
  site: SiteFacts | null;
  siteError: string | null;
  mobile: { run: SpeedRun; screenshot: string | null } | null;
  mobileError: string | null;
  desktop: { run: SpeedRun } | null;
  desktopError: string | null;
  profile: ProfileFacts | null;
  profileNote: string | null;
}): AuditFacts {
  const gaps: string[] = [];
  if (parts.siteError) gaps.push(`The site itself couldn’t be read: ${parts.siteError}.`);
  if (parts.mobileError) gaps.push(`Phone speed couldn’t be measured: ${parts.mobileError}.`);
  if (parts.desktopError) gaps.push(`Desktop speed couldn’t be measured: ${parts.desktopError}.`);
  if (parts.profileNote) gaps.push(parts.profileNote);
  if (parts.site?.skipped) gaps.push(`${parts.site.skipped} page(s) were skipped because the site’s robots.txt asks bots not to read them.`);
  if (parts.mobile?.run.field === null) gaps.push('There isn’t enough real-visitor data in Google’s Chrome reports for this site, so speed is from a test visit only.');
  return {
    url: parts.url,
    domain: parts.domain,
    gatheredAt: new Date().toISOString(),
    speed: { mobile: parts.mobile?.run ?? null, desktop: parts.desktop?.run ?? null },
    screenshot: parts.mobile?.screenshot ?? null,
    site: parts.site,
    profile: parts.profile,
    visitor: { wantsMoreOf: parts.wantsMoreOf },
    gaps,
  };
}

/** an error, as a short plain line for the facts' gaps */
export const reason = (error: unknown) => (error instanceof Error ? error.message : String(error)).slice(0, 200);
