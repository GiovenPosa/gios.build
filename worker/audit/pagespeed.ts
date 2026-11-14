// Speed, from Google's PageSpeed Insights API (spec §5.1): it runs Lighthouse
// on Google's machines, so no browser is needed here. One run per strategy
// (mobile, desktop). Free; with the Worker's GOOGLE_API_KEY its daily quota
// is far above what audits need, and without one it still works, slowly
// running out of a small shared quota.

import type { SpeedRun } from './facts';

const API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const CATEGORIES = ['performance', 'seo', 'accessibility', 'best-practices'];

interface Lighthouse {
  categories?: Record<string, { score?: number | null }>;
  audits?: Record<string, { numericValue?: number; details?: { data?: string } }>;
}
interface Metric {
  percentile?: number;
  category?: string;
}
interface PsiResponse {
  lighthouseResult?: Lighthouse;
  loadingExperience?: {
    overall_category?: string;
    metrics?: Record<string, Metric>;
  };
  error?: { message?: string };
}

const score = (lh: Lighthouse, key: string) => {
  const value = lh.categories?.[key]?.score;
  return typeof value === 'number' ? Math.round(value * 100) : null;
};
const ms = (lh: Lighthouse, key: string) => {
  const value = lh.audits?.[key]?.numericValue;
  return typeof value === 'number' ? Math.round(value) : null;
};

export async function pageSpeed(url: string, strategy: 'mobile' | 'desktop', key?: string) {
  const params = new URLSearchParams({ url, strategy });
  for (const category of CATEGORIES) params.append('category', category);
  if (key) params.set('key', key.trim());

  const response = await fetch(`${API}?${params}`, { signal: AbortSignal.timeout(90_000) });
  const data = (await response.json()) as PsiResponse;
  if (!response.ok || !data.lighthouseResult) {
    throw new Error(`PageSpeed ${strategy}: ${data.error?.message ?? response.status}`);
  }

  const lh = data.lighthouseResult;
  const metrics = data.loadingExperience?.metrics;
  const percentile = (name: string) => metrics?.[name]?.percentile ?? null;
  const cls = lh.audits?.['cumulative-layout-shift']?.numericValue;
  const weight = lh.audits?.['total-byte-weight']?.numericValue;

  const run: SpeedRun = {
    performance: score(lh, 'performance'),
    seo: score(lh, 'seo'),
    accessibility: score(lh, 'accessibility'),
    bestPractices: score(lh, 'best-practices'),
    fcpMs: ms(lh, 'first-contentful-paint'),
    lcpMs: ms(lh, 'largest-contentful-paint'),
    tbtMs: ms(lh, 'total-blocking-time'),
    speedIndexMs: ms(lh, 'speed-index'),
    interactiveMs: ms(lh, 'interactive'),
    cls: typeof cls === 'number' ? Math.round(cls * 1000) / 1000 : null,
    weightKb: typeof weight === 'number' ? Math.round(weight / 1024) : null,
    // CLS comes back from CrUX multiplied by 100
    field: metrics
      ? {
          overall: data.loadingExperience?.overall_category ?? null,
          lcpMs: percentile('LARGEST_CONTENTFUL_PAINT_MS'),
          inpMs: percentile('INTERACTION_TO_NEXT_PAINT'),
          cls: percentile('CUMULATIVE_LAYOUT_SHIFT_SCORE') !== null ? percentile('CUMULATIVE_LAYOUT_SHIFT_SCORE')! / 100 : null,
        }
      : null,
  };
  // the phone run's last frame, shown at the top of the report
  const screenshot = strategy === 'mobile' ? lh.audits?.['final-screenshot']?.details?.data ?? null : null;
  return { run, screenshot };
}
