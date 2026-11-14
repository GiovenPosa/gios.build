import { GoArrowRight } from 'react-icons/go';
import './page-styles/areaPage.css';
import './page-styles/auditPage.css';
import { PageMeta } from '../components/pageMeta';
import { Reveal } from '../components/reveal';
import { PageHero, type HeroLine } from '../components/pageHero';
import { AuditForm } from '../components/auditForm';
import { FaqThread } from '../components/faqThread';
import { ClosingCta } from '../components/closingCta';
import { AUDIT_CHECKS, AUDIT_FAQ, AUDIT_SAMPLE, AUDIT_TURNAROUND } from '../data/audit';

const HERO_LINES: HeroLine[] = [
  { left: 'Is your', right: 'website', stop: false },
  { left: 'costing you', right: 'customers?', stop: false },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

/**
 * The free website audit (docs/website-audit/spec.md): the shared hero, what
 * the audit looks at, part of a real report (its business's name left out),
 * the request form, questions, and the closing call. The area pages' layout
 * and spacing (areaPage.css).
 */
export function AuditPage() {
  return (
    <>
      <PageMeta path='/website-audit' />

      <div className='area-page'>
        <div className='area-page-container'>
          <PageHero
            className='area-hero'
            lines={HERO_LINES}
            sub={`A free audit of your website’s speed, Google and local search, in plain English, with what to fix first. In your inbox ${AUDIT_TURNAROUND}.`}
            actions={
              <>
                <button type='button' className='hero-action-button hero-cta-pulse' onClick={() => scrollTo('audit-request')}>
                  <p>Get my free audit</p>
                  <GoArrowRight aria-hidden />
                </button>
                <button type='button' className='hero-action-button secondary' onClick={() => scrollTo('audit-sample')}>
                  <p>See an example</p>
                </button>
              </>
            }
          />

          <div className='area-sections'>
            <section className='area-findings' aria-labelledby='audit-checks-title'>
              <Reveal as='h2' className='home-faq-headline' id='audit-checks-title'>
                <span>What the audit</span> <span>looks at.</span>
              </Reveal>
              <Reveal as='p' className='home-faq-subtext' delay={60}>
                Three things decide whether people find you, wait for you and get in touch.
              </Reveal>
              <ul className='area-findings-list'>
                {AUDIT_CHECKS.map((item, index) => (
                  <Reveal as='li' key={item.title} className='area-finding' delay={index * 80}>
                    <span className='area-finding-figure'>{item.title}</span>
                    <p>{item.text}</p>
                  </Reveal>
                ))}
              </ul>
            </section>

            <section className='audit-sample-block' id='audit-sample' aria-labelledby='audit-sample-title'>
              <div className='area-packages-head'>
                <Reveal as='h2' className='home-faq-headline' id='audit-sample-title'>
                  <span>What you’ll</span> <span>get back.</span>
                </Reveal>
                <Reveal as='p' className='home-faq-subtext' delay={60}>
                  Part of a real report, for {AUDIT_SAMPLE.site}, with its name left out.
                </Reveal>
              </div>

              <Reveal as='div' className='audit-sample' delay={80}>
                <p className='audit-sample-kicker'>Website audit</p>
                <p className='audit-sample-verdict'>{AUDIT_SAMPLE.verdict}</p>

                <ul className='audit-sample-scores'>
                  {AUDIT_SAMPLE.scorecards.map((card) => (
                    <li key={card.area}>
                      <span className='audit-sample-area'>{card.area}</span>
                      <span className={`audit-rating is-${card.rating.replace(' ', '-')}`}>
                        {card.rating.charAt(0).toUpperCase() + card.rating.slice(1)}
                      </span>
                      <span className='audit-sample-detail'>{card.detail}</span>
                    </li>
                  ))}
                </ul>

                <p className='audit-sample-label'>What’s costing you customers</p>
                <ul className='audit-sample-problems'>
                  {AUDIT_SAMPLE.problems.map((problem) => (
                    <li key={problem.title}>
                      <h3>{problem.title}</h3>
                      <p>{problem.text}</p>
                    </li>
                  ))}
                </ul>

                <div className='audit-sample-row'>
                  <div className='audit-sample-note'>
                    <p className='audit-sample-label'>A quick win</p>
                    <p>{AUDIT_SAMPLE.quickWin}</p>
                  </div>
                  <div className='audit-sample-note is-dark'>
                    <p className='audit-sample-label'>How gios.build can help</p>
                    <p>{AUDIT_SAMPLE.help}</p>
                  </div>
                </div>
              </Reveal>
            </section>

            <section className='audit-request' id='audit-request' aria-labelledby='audit-request-title'>
              <div className='audit-request-copy'>
                <Reveal as='h2' className='home-faq-headline' id='audit-request-title'>
                  <span>Get your</span> <span>free audit.</span>
                </Reveal>
                <Reveal as='ol' className='audit-steps' delay={60}>
                  <li>
                    <span>01</span>
                    <p>Enter your website, and where to send the report.</p>
                  </li>
                  <li>
                    <span>02</span>
                    <p>Your site gets checked for speed, Google and local search.</p>
                  </li>
                  <li>
                    <span>03</span>
                    <p>Your report arrives by email {AUDIT_TURNAROUND}, with what to fix first.</p>
                  </li>
                </Reveal>
              </div>
              <Reveal as='div' className='audit-request-form' delay={120}>
                <AuditForm />
              </Reveal>
            </section>

            <section className='home-faq-block'>
              <Reveal as='h2' className='home-faq-headline'>
                <span>Questions?</span> <span>Just ask.</span>
              </Reveal>
              <Reveal as='p' className='home-faq-subtext' delay={60}>
                What people usually want to know before asking for an audit.
              </Reveal>
              <FaqThread items={AUDIT_FAQ} />
            </section>

            <ClosingCta />
          </div>
        </div>
      </div>
    </>
  );
}
