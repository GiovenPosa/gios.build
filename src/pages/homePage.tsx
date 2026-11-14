import { useCallback, useState } from 'react';
import './page-styles/homePage.css';
import { GoArrowRight } from "react-icons/go";
// Paused with the "Where I've worked and built" section below — uncomment both together to bring it back.
// import RinfoIcon from '../assets/icons/rinfo.svg?react';
// import VanawaysIcon from '../assets/icons/vanaways.svg?react';
// import IbmIcon from '../assets/icons/ibm.svg?react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { PageMeta } from '../components/pageMeta';
import { toolsData } from '../data/tools';
import { Reveal } from '../components/reveal';
import { ToolsWheel } from '../components/toolsWheel';
import { ProcessSteps } from '../components/processSteps';
import { SearchShowcase } from '../components/searchShowcase';
import { ServicesType } from '../components/servicesType';
import { FaqThread } from '../components/faqThread';
import { Testimonials } from '../components/testimonials';
import { StoryStack } from '../components/storyStack';
import { ClosingCta } from '../components/closingCta';
import { ResultsLenses } from '../components/resultsLenses';
import { WorkGrid } from '../components/workGrid';
import { workData } from '../data/work';
import { PageHero, type HeroLine } from '../components/pageHero';

// the headline: a sticker sits at the start of each line's second half
const HERO_LINES: HeroLine[] = [
  { left: 'Most websites', right: 'blend in' },
  { left: 'Yours', right: "won't" },
];

export function HomePage() {
  const { openBooking } = useBooking();
  // the work's top row comes in once the headline and buttons have landed
  const [heroSettled, setHeroSettled] = useState(false);
  const settle = useCallback(() => setHeroSettled(true), []);

  return (
    <>
      <PageMeta path='/' />

      <div className='home-page'>
        <div className='home-page-container'>
          {/* the orb is off for now: pass `orb` to bring it back */}
          <PageHero
            className='home-page-hero-section'
            lines={HERO_LINES}
            hidden='Web design for small businesses in Bath, Bristol and across the UK.'
            sub="Built around your customers: what they're looking for, and what makes them pick you. See your free homepage mockup before you spend a penny."
            onSettled={settle}
            actions={
              <>
                <button type='button' className='hero-action-button hero-cta-pulse' onClick={() => openBooking('Hero')}>
                  <p>Get a free mockup</p>
                  <GoArrowRight aria-hidden />
                </button>
                {/* a tiny version of the work grid below; its tiles reshuffle on
                    hover and a mono label slides out beside it */}
                <Link to='/work' className='hero-action-button secondary hero-work-button' aria-label='See my work'>
                  <span className='hero-work-label' aria-hidden>Work</span>
                  <span className='work-icon' aria-hidden>
                    <span><i /><i /></span>
                    <span><i /><i /></span>
                  </span>
                </Link>
              </>
            }
          />

          <section className='home-work-section'>
            <WorkGrid items={workData} hold={!heroSettled} captions={false} />
          </section>

          <section className='home-page-info-section'>
            <SearchShowcase />

            <ServicesType />

            <ProcessSteps />

            <ResultsLenses />

            {/* the words in the middle, a wheel of tools either side: the
                left one turns down, the right one up */}
            <div className='tools-info-block'>
              <Reveal as="div" className='tools-wheel-reveal'>
                <ToolsWheel tools={toolsData.slice(0, 9)} turn='down' side='left' />
              </Reveal>
              <div className='tools-copy'>
                <Reveal as="h2" className='tools-headline' delay={60}>
                  <span>New website.</span> <span>Same tools.</span>
                </Reveal>
                <Reveal as="p" className='tools-subtext' delay={120}>
                  I build your site around the tools your business already runs on, from Stripe to Shopify.
                </Reveal>
                <Reveal as="div" className='tools-action' delay={180}>
                  <button type='button' className='hero-action-button' onClick={() => openBooking('Tools')}>
                    <p>Get a free mockup</p>
                    <GoArrowRight aria-hidden />
                  </button>
                </Reveal>
                <ul className='visually-hidden'>
                  {toolsData.map((tool) => <li key={tool.name}>{tool.name}</li>)}
                </ul>
              </div>
              <Reveal as="div" className='tools-wheel-reveal' delay={120}>
                <ToolsWheel tools={toolsData.slice(9)} turn='up' side='right' />
              </Reveal>
            </div>

            <Testimonials />

            <StoryStack />

            <section className='home-faq-block'>
              <Reveal as="h2" className='home-faq-headline'>
                <span>Questions?</span> <span>Just ask.</span>
              </Reveal>
              <Reveal as="p" className='home-faq-subtext' delay={60}>
                The things people usually want to know before we start.
              </Reveal>
              <FaqThread />
            </section>

            <ClosingCta />

            {/* Paused for now — keeping the code so it's easy to bring back.
            <Reveal as="p" className='clients-label'>Where I've worked and built</Reveal>
            <div className='clients-block'>
              <Reveal as="span" delay={0}><VanawaysIcon className='client-icon'/></Reveal>
              <Reveal as="span" delay={80}><IbmIcon className='client-icon'/></Reveal>
              <Reveal as="span" delay={160}><RinfoIcon className='client-icon'/></Reveal>
            </div>
            */}
          </section>
        </div>
      </div>
    </>
  );
}