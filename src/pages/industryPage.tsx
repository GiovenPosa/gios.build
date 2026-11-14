import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import './page-styles/areaPage.css';
import './page-styles/industryPage.css';
import { PageMeta } from '../components/pageMeta';
import { useBooking } from '../context/bookingContext';
import { Reveal } from '../components/reveal';
import { PageHero } from '../components/pageHero';
import { SearchShowcase } from '../components/searchShowcase';
import { LoopVideo } from '../components/loopVideo';
import { PackageStack } from '../components/packageStack';
import { ProcessSteps } from '../components/processSteps';
import { FaqThread } from '../components/faqThread';
import { ClosingCta } from '../components/closingCta';
import { AuditNudge } from '../components/auditNudge';
import { workData } from '../data/work';
import { workPath } from '../data/workAbout';
import type { Industry } from '../data/industries';
import type { PagePath } from '../data/seo';
import KapeHero from '../assets/project-images/services/kape-1-hero.webp';
import KapeMenu from '../assets/project-images/mobile/kape-4-our-menu.webp';
import KapeNew from '../assets/project-images/mobile/kape-3-new-on-menu.webp';
import KapeAfternoon from '../assets/project-images/mobile/kape-5-merienda.webp';
import OssaHero from '../assets/project-images/services/ossa-1-hero.webp';
import OssaNew from '../assets/project-images/services/ossa-3-new.webp';
import OssaSeen from '../assets/project-images/mobile/ossa-2-seen.webp';
import OssaReviews from '../assets/project-images/services/ossa-8-reviews.webp';
import PrimeStockHero from '../assets/project-images/mobile/primestock-1-hero.webp';
import PrimeStockAlwaysOn from '../assets/project-images/mobile/primestock-2-always-on.webp';
import PrimeStockFounding from '../assets/project-images/mobile/primestock-5-founding.webp';
import PrimeStockQuote from '../assets/project-images/services/primestock-6-quote-form.webp';

// the phone screenshots the features point at (data/industries.ts), each
// with what it shows, for image search
const FEATURE_SHOTS: Record<string, { src: string; alt: string }> = {
  'kape-hero': { src: KapeHero, alt: 'The Kape Coffee website’s home page on a phone, by gios.build' },
  'kape-menu': { src: KapeMenu, alt: 'The Kape Coffee menu, written out on a phone, by gios.build' },
  'kape-new': { src: KapeNew, alt: 'New drinks on the Kape Coffee menu, on a phone, by gios.build' },
  'kape-afternoon': { src: KapeAfternoon, alt: 'Kape Coffee’s afternoon merienda menu on a phone, by gios.build' },
  'ossa-hero': { src: OssaHero, alt: 'The Ossa Pilates home page on a phone, with its Book button, by gios.build' },
  'ossa-new': { src: OssaNew, alt: 'The Ossa Pilates page for beginners on a phone, by gios.build' },
  'ossa-seen': { src: OssaSeen, alt: 'Ossa Pilates’ small-group classes on a phone, by gios.build' },
  'ossa-reviews': { src: OssaReviews, alt: 'Google reviews on the Ossa Pilates website, on a phone, by gios.build' },
  'psc-hero': { src: PrimeStockHero, alt: 'The Prime Stock Central home page on a phone, with its Get a quote button, by gios.build' },
  'psc-always-on': { src: PrimeStockAlwaysOn, alt: 'Prime Stock Central’s “Always stocked. Always on.” on a phone, by gios.build' },
  'psc-founding': { src: PrimeStockFounding, alt: 'Prime Stock Central’s founding partners offer on a phone, by gios.build' },
  'psc-quote': { src: PrimeStockQuote, alt: 'The Prime Stock Central quote request form on a phone, by gios.build' },
};

/**
 * A page for one kind of business (data/industries.ts), in the area pages'
 * layout (areaPage.css): the hero, what their customers search for, one
 * project of that kind shown big, what those customers look for (each with
 * a phone from the project), the prices, the steps, their questions and
 * the closing call.
 */
export function IndustryPage({ industry }: { industry: Industry }) {
  const { openBooking } = useBooking();
  const source = `Industry: ${industry.name}`;
  const project = workData.find((item) => item.title === industry.project.title);

  return (
    <>
      <PageMeta path={industry.path as PagePath} />

      <div className='area-page'>
        <div className='area-page-container'>
          <PageHero
            className='area-hero'
            lines={industry.hero.lines}
            sub={industry.hero.sub}
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
            <SearchShowcase headline={industry.search.headline} lines={industry.search.lines} queries={industry.search.queries} />

            {project && (
              <section className='ind-project' aria-labelledby='ind-project-title'>
                <Reveal as='div' className='ind-project-media'>
                  <LoopVideo
                    lazy
                    src={project.media.src}
                    webm={project.media.webm}
                    poster={project.media.poster}
                    aria-label={`The ${project.title} website, scrolling`}
                  />
                </Reveal>
                <div className='ind-project-copy'>
                  {project.icon && <img className='ind-project-icon' src={project.icon} alt='' width={56} height={56} />}
                  <Reveal as='h2' className='home-faq-headline' id='ind-project-title'>
                    {industry.project.headline.map((line) => <span key={line}>{line}</span>)}
                  </Reveal>
                  <Reveal as='p' className='ind-project-text' delay={60}>
                    {industry.project.text}
                  </Reveal>
                  <Reveal as='div' delay={120}>
                    <Link to={workPath(project.title)} className='ind-project-link'>
                      See {project.title} <GoArrowRight aria-hidden />
                    </Link>
                  </Reveal>
                </div>
              </section>
            )}

            <section className='ind-features' aria-labelledby='ind-features-title'>
              <div className='area-packages-head'>
                <Reveal as='h2' className='home-faq-headline' id='ind-features-title'>
                  {industry.features.headline.map((line) => <span key={line}>{line}</span>)}
                </Reveal>
                <Reveal as='p' className='home-faq-subtext' delay={60}>
                  {industry.features.sub}
                </Reveal>
              </div>
              <ul className='ind-features-list'>
                {industry.features.items.map((item, index) => {
                  const shot = FEATURE_SHOTS[item.shot];
                  return (
                    <Reveal as='li' key={item.title} className='ind-feature' delay={(index % 2) * 80}>
                      <div className='ind-feature-copy'>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                      {shot && (
                        <div className='ind-feature-shot'>
                          <img src={shot.src} alt={shot.alt} loading='lazy' decoding='async' />
                        </div>
                      )}
                    </Reveal>
                  );
                })}
              </ul>
              <AuditNudge />
            </section>

            <section className='area-packages' aria-labelledby='area-packages-title'>
              <div className='area-packages-head'>
                <Reveal as='h2' className='home-faq-headline' id='area-packages-title'>
                  {industry.packages.headline.map((line) => <span key={line}>{line}</span>)}
                </Reveal>
                <Reveal as='p' className='home-faq-subtext' delay={60}>
                  {industry.packages.sub}
                </Reveal>
              </div>
              <PackageStack />
            </section>

            <ProcessSteps />

            <section className='home-faq-block'>
              <Reveal as='h2' className='home-faq-headline'>
                <span>Questions?</span> <span>Just ask.</span>
              </Reveal>
              <Reveal as='p' className='home-faq-subtext' delay={60}>
                What {industry.name} usually want to know before getting started.
              </Reveal>
              <FaqThread items={industry.faq} />
            </section>

            <ClosingCta />
          </div>
        </div>
      </div>
    </>
  );
}
