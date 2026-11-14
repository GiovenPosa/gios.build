// The audit's background run (docs/website-audit/spec.md §4), a Cloudflare
// Workflow started by POST /api/audit (worker/audit.ts) for each new request.
// Each step's result is saved by Cloudflare, so a retry or a restart picks up
// where it left off rather than reading the site again.
//
// Phase 2: gather the facts (the site, its speed on phones and computers,
// and its Google profile when Places is on), save them to the audit, and
// leave it for review. Phase 3 adds Claude writing the report after this.
//
// A part that fails after its retries becomes a "gap" in the facts, not a
// failed audit; only a site that can't be read at all fails the audit.

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { db } from './enquiry';
import { readSite } from './audit/crawl';
import { pageSpeed } from './audit/pagespeed';
import { findProfile } from './audit/places';
import { assemble, profileQuery, reason, type GatherEnv } from './audit/gather';
import type { ProfileFacts } from './audit/facts';

export interface AuditWorkflowEnv extends GatherEnv {
  SUPABASE_URL: string;
  SUPABASE_SECRET_KEY: string;
}

export interface AuditParams {
  auditId: string;
}

const PAGESPEED = {
  retries: { limit: 2, delay: '20 seconds', backoff: 'exponential' },
  timeout: '3 minutes',
} as const;

export class AuditWorkflow extends WorkflowEntrypoint<AuditWorkflowEnv, AuditParams> {
  async run(event: WorkflowEvent<AuditParams>, step: WorkflowStep) {
    const env = this.env;
    const { auditId } = event.payload;
    const setStatus = (fields: Record<string, unknown>) =>
      db(env, `audits?id=eq.${auditId}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(fields) });

    const audit = await step.do('load the request', async () => {
      const [row] = await db(env, `audits?id=eq.${auditId}&select=id,url,domain,wants_more_of,status`);
      return row ? { url: String(row.url), domain: String(row.domain), wantsMoreOf: (row.wants_more_of as string | null) ?? null, status: String(row.status) } : null;
    });
    if (!audit || audit.status !== 'queued') return;

    await step.do('mark as gathering', async () => {
      await setStatus({ status: 'gathering' });
    });

    // the site first: without it there's nothing to audit
    let site = null;
    let siteError: string | null = null;
    try {
      site = await step.do('read the site', { retries: { limit: 2, delay: '10 seconds', backoff: 'linear' }, timeout: '4 minutes' }, () =>
        readSite(audit.url)
      );
    } catch (error) {
      siteError = reason(error);
    }

    let mobile = null;
    let mobileError: string | null = null;
    try {
      mobile = await step.do('measure speed on a phone', PAGESPEED, () => pageSpeed(audit.url, 'mobile', env.GOOGLE_API_KEY));
    } catch (error) {
      mobileError = reason(error);
    }

    let desktop = null;
    let desktopError: string | null = null;
    try {
      desktop = await step.do('measure speed on a computer', PAGESPEED, async () => ({
        run: (await pageSpeed(audit.url, 'desktop', env.GOOGLE_API_KEY)).run,
      }));
    } catch (error) {
      desktopError = reason(error);
    }

    let profile: ProfileFacts | null = null;
    let profileNote: string | null = null;
    const query = site ? profileQuery(site) : null;
    if (env.AUDIT_PLACES !== 'true' || !env.GOOGLE_API_KEY) {
      profileNote = 'The Google Business Profile wasn’t checked.';
    } else if (!query) {
      profileNote = 'The Google Business Profile wasn’t checked: the site doesn’t give its business name.';
    } else {
      try {
        profile = await step.do('find the Google profile', { retries: { limit: 1, delay: '10 seconds' }, timeout: '1 minute' }, () =>
          findProfile(env.GOOGLE_API_KEY!, audit.domain, query, { business: site!.businessData, phone: site!.phoneOnSite })
        );
        if (!profile.found) profileNote = 'No Google Business Profile linking to this website was found.';
      } catch (error) {
        profileNote = `The Google Business Profile couldn’t be checked: ${reason(error)}.`;
      }
    }

    const facts = assemble({
      url: audit.url,
      domain: audit.domain,
      wantsMoreOf: audit.wantsMoreOf,
      site,
      siteError,
      mobile,
      mobileError,
      desktop,
      desktopError,
      profile,
      profileNote,
    });

    // saved for review (phase 3 hands them to Claude from here instead)
    await step.do('save the facts', async () => {
      await setStatus(
        site
          ? { facts, status: 'review' }
          : { facts, status: 'failed', fail_reason: siteError ?? 'The site couldn’t be read.' }
      );
    });
  }
}
