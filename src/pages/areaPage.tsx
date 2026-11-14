import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import './page-styles/areaPage.css';
import { PageMeta } from '../components/pageMeta';
import { useBooking } from '../context/bookingContext';
import { Reveal } from '../components/reveal';
import { PageHero } from '../components/pageHero';
import { SearchShowcase } from '../components/searchShowcase';
import { WorkGrid } from '../components/workGrid';
import { PackageStack } from '../components/packageStack';
import { ProcessSteps } from '../components/processSteps';
import { FaqThread } from '../components/faqThread';
import { ClosingCta } from '../components/closingCta';
import { workData } from '../data/work';
import type { Area } from '../data/areas';
import type { PagePath } from '../data/seo';

/**
 * A town's page (data/areas.ts): the home page's sections in the home page's
 * order, in the town's own words. The hero is the home page's, stickers and
 * all, naming the town; the search types
 * out what people there search for; then why customers there pick someone
 * else (the one section only these pages have), the work, the prices,
 * the steps, the town's questions, and the closing call.
 */
export function AreaPage({ area }: { area: Area }) {
  const { openBooking } = useBooking();
  const source = `Area: ${area.town}`;

  return (
    <>
      <PageMeta path={area.path as PagePath} />

      <div className='area-page'>
        <div className='area-page-container'>
          <PageHero
            className='area-hero'
            lines={area.hero.lines}
            sub={area.hero.sub}
            actions={
              <>
                <button type='button' className='hero-action-button hero-cta-pulse' onClick={() => openBooking(source)}>
                  <p>Get a free mockup</p>
                  <GoArrowRight aria-hidden />
                </button>
                <Link to='/work' className='hero-action-button secondary'>
                  <p>See the work</p>
                </Link>
              </>
            }
          />

          <div className='area-sections'>
            <SearchShowcase headline={area.search.headline} lines={area.search.lines} queries={area.search.queries} />

            <section className='area-findings' aria-labelledby='area-findings-title'>
              <Reveal as='h2' className='home-faq-headline' id='area-findings-title'>
                {area.findings.headline.map((line) => <span key={line}>{line}</span>)}
              </Reveal>
              <Reveal as='p' className='home-faq-subtext' delay={60}>
                {area.findings.sub}
              </Reveal>
              <ul className='area-findings-list'>
                {area.findings.items.map((item, index) => (
                  <Reveal as='li' key={item.figure} className='area-finding' delay={index * 80}>
                    <span className='area-finding-figure'>{item.figure}</span>
                    <p>{item.text}</p>
                  </Reveal>
                ))}
              </ul>
              <Reveal as='p' className='area-findings-foot' delay={120}>
                {area.findings.foot}
              </Reveal>
            </section>

            <section className='area-work' aria-label='Recent websites'>
              <WorkGrid items={workData} />
            </section>

            <section className='area-packages' aria-labelledby='area-packages-title'>
              <div className='area-packages-head'>
                <Reveal as='h2' className='home-faq-headline' id='area-packages-title'>
                  {area.packages.headline.map((line) => <span key={line}>{line}</span>)}
                </Reveal>
                <Reveal as='p' className='home-faq-subtext' delay={60}>
                  {area.packages.sub}
                </Reveal>
              </div>
              <PackageStack />
            </section>

            <ProcessSteps />

            <section className='home-faq-block'>
              <Reveal as='h2' className='home-faq-headline'>
                <span>{area.town} questions?</span> <span>Just ask.</span>
              </Reveal>
              <Reveal as='p' className='home-faq-subtext' delay={60}>
                What people around {area.town} usually want to know before we start.
              </Reveal>
              <FaqThread items={area.faq} />
            </section>

            <ClosingCta />
          </div>
        </div>
      </div>
    </>
  );
}
