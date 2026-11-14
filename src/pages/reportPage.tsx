import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { GoArrowRight } from 'react-icons/go';
import './page-styles/areaPage.css';
import './page-styles/auditPage.css';
import './page-styles/reportPage.css';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import { packagesData, priceRange } from '../data/packages';
import type { AuditReport } from '../data/auditReport';
import { WhatsAppLink } from '../components/whatsappLink';

// An audit's private report (docs/website-audit/spec.md §10), at
// /report/<id>: the verdict, three scorecards, what's costing them
// customers with the real numbers beside each, what stood out, quick wins,
// how gios.build can help (ending at the free mockup), and how the audit
// was done. The Worker serves it with noindex; it's never in the sitemap.

interface ReportData {
  url: string;
  domain: string;
  createdAt: string;
  gatheredAt: string;
  preview: boolean;
  report: AuditReport;
  evidence: { key: string; label: string; value: string | number | boolean }[];
  screenshot: string | null;
  gaps: string[];
}

const AREA_LABEL = { speed: 'Speed', google: 'Google', local: 'Local' } as const;
const sentence = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const showValue = (value: string | number | boolean) => (value === true ? 'Yes' : value === false ? 'No' : String(value));
const dateOf = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function ReportPage() {
  const { id } = useParams();
  const { openBooking } = useBooking();
  const [data, setData] = useState<ReportData | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/audit/report/${id}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((result: ReportData) => {
        if (cancelled) return;
        setData(result);
        setState('ready');
        if (!result.preview) track('Report viewed');
      })
      .catch(() => !cancelled && setState('missing'));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state !== 'ready' || !data) {
    return (
      <div className='area-page'>
        <Helmet>
          <title>Website audit | gios.build</title>
          <meta name='robots' content='noindex, nofollow' />
        </Helmet>
        <div className='area-page-container report-status'>
          {state === 'loading' ? (
            <p>Loading your report…</p>
          ) : (
            <>
              <h1 className='home-faq-headline'>This report isn’t here.</h1>
              <p>
                The link may be mistyped, or the report may not be ready yet. Email{' '}
                <a href='mailto:contact@gios.build'>contact@gios.build</a> and it’ll be sorted.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  const { report } = data;
  const pkg = packagesData.find((p) => p.id === report.recommendation.package);
  const evidence = new Map(data.evidence.map((row) => [row.key, row]));
  const mockup = () => {
    track('Mockup from report', { package: report.recommendation.package });
    openBooking('Audit report', {
      packageId: report.recommendation.package,
      message: `From my website audit of ${data.domain}.`,
    });
  };

  return (
    <>
      <Helmet>
        <title>{`Website audit: ${data.domain} | gios.build`}</title>
        <meta name='robots' content='noindex, nofollow' />
      </Helmet>

      <div className='area-page'>
        <div className='area-page-container report-page'>
          <header className='report-head'>
            <div className='report-head-copy'>
              <p className='audit-sample-kicker'>
                Website audit · {data.domain} · {dateOf(data.gatheredAt)}
              </p>
              <h1 className='report-business'>{report.business.name}</h1>
              <p className='report-verdict'>{report.verdict}</p>
              <ul className='audit-sample-scores report-scores'>
                {report.scorecards.map((card) => (
                  <li key={card.area}>
                    <span className='audit-sample-area'>{AREA_LABEL[card.area]}</span>
                    <span className={`audit-rating is-${card.rating.replace(' ', '-')}`}>{sentence(card.rating)}</span>
                    <span className='audit-sample-detail'>{card.summary}</span>
                  </li>
                ))}
              </ul>
            </div>
            {data.screenshot && (
              <figure className='report-shot'>
                <img src={data.screenshot} alt={`The home page of ${data.domain} on a phone`} />
                <figcaption>Your home page on a phone</figcaption>
              </figure>
            )}
          </header>

          <section className='report-section' aria-labelledby='report-problems'>
            <h2 className='report-section-title' id='report-problems'>What’s costing you customers</h2>
            <ol className='report-problems'>
              {report.problems.map((problem) => (
                <li key={problem.title} className={`report-problem is-${problem.severity}`}>
                  <h3>{problem.title}</h3>
                  <p>{problem.whatItCosts}</p>
                  {problem.evidence.some((key) => evidence.has(key)) && (
                    <ul className='report-evidence'>
                      {problem.evidence
                        .filter((key) => evidence.has(key))
                        .map((key) => {
                          const row = evidence.get(key)!;
                          return (
                            <li key={key}>
                              <span>{row.label}</span>
                              <strong>{showValue(row.value)}</strong>
                            </li>
                          );
                        })}
                    </ul>
                  )}
                  <p className='report-fix'>
                    <span>The fix</span> {problem.fix}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {report.observations.length > 0 && (
            <section className='report-section' aria-labelledby='report-observations'>
              <h2 className='report-section-title' id='report-observations'>What stood out</h2>
              <ul className='report-notes'>
                {report.observations.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          )}

          <section className='report-section' aria-labelledby='report-wins'>
            <h2 className='report-section-title' id='report-wins'>Quick wins you can do today</h2>
            <ul className='report-wins'>
              {report.quickWins.map((win) => (
                <li key={win.title}>
                  <h3>{win.title}</h3>
                  <p>{win.how}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className='report-help' aria-labelledby='report-help'>
            <p className='audit-sample-label'>How gios.build can help</p>
            <h2 id='report-help'>
              {pkg?.name ?? 'A new website'}
              {pkg && <span>{priceRange(pkg)}</span>}
            </h2>
            <p>{report.recommendation.why}</p>
            <ul>
              {report.recommendation.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {report.recommendation.alsoConsider && <p className='report-help-also'>{report.recommendation.alsoConsider}</p>}
            <p className='report-help-closing'>{report.closing}</p>
            <div className='report-help-actions'>
              <button type='button' className='hero-action-button light report-help-button' onClick={mockup}>
                <p>Get my free mockup</p>
                <GoArrowRight aria-hidden />
              </button>
              {/* or straight to a chat about it, the audit named in the first message */}
              <WhatsAppLink
                className='hero-action-button report-help-whatsapp'
                from='Audit report'
                message={`Hi Gio, I've just read my website audit for ${data.domain} and I'd like to chat about it.`}
                revealNumber
              >
                <p>WhatsApp me</p>
              </WhatsAppLink>
              <Link to='/work' className='report-help-link'>
                See recent work
              </Link>
            </div>
          </section>

          <section className='report-method' aria-labelledby='report-method'>
            <h2 id='report-method'>How this audit works</h2>
            <p>
              On {dateOf(data.gatheredAt)}, {data.url.replace(/^https?:\/\//, '')} was checked the way any visitor or search
              engine sees it: speed with Google’s PageSpeed Insights (a test visit on a phone and a computer), up to ten of its
              pages read for what Google can see, and its Google Business Profile where one links to the site. The numbers are
              those measurements; the words were written from them with the help of AI and checked by gios.build. Speed varies a
              little from visit to visit, and no audit can say exactly where a site ranks, since Google personalises its results.
            </p>
            {data.gaps.length > 0 && (
              <ul>
                {data.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
