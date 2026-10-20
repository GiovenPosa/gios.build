import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import './page-styles/homePage.css';
import { GoArrowUpRight } from "react-icons/go";
// Paused with the "Where I've worked and built" section below — uncomment both together to bring it back.
// import RinfoIcon from '../assets/icons/rinfo.svg?react';
// import VanawaysIcon from '../assets/icons/vanaways.svg?react';
// import IbmIcon from '../assets/icons/ibm.svg?react';
import ProcessCard from '../assets/project-images/process-cards.svg';
import GiosBuildFontsAnimate from '../assets/project-images/gios-build-fonts.mp4';
import GiosBuildFontsPoster from '../assets/project-images/gios-build-fonts.webp';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { PageMeta } from '../components/pageMeta';
import { toolsData } from '../data/tools';
import { Reveal } from '../components/reveal';
import { ToolIcon } from '../components/toolIcon';
import { ProcessSteps } from '../components/processSteps';
import { ServicesType } from '../components/servicesType';
import { FaqThread } from '../components/faqThread';
import { Testimonials } from '../components/testimonials';
import { SectionBar } from '../components/sectionBar';
import { LoopVideo } from '../components/loopVideo';
import { StoryStack } from '../components/storyStack';
import { ClosingCta } from '../components/closingCta';
import { ResultsLenses } from '../components/resultsLenses';
import { WorkGrid } from '../components/workGrid';
import { workData } from '../data/work';


// The hero headline builds itself once per visit: on first load, not every
// time you come back to the home page.
let heroBuilt = false;
const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 'wait' hides the headline until its font is in (so it never builds in a
 * fallback font), 'build' plays it, 'done' shows it as it is.
 */
function useHeroBuild() {
  const [phase, setPhase] = useState<'wait' | 'build' | 'done'>(() =>
    heroBuilt || reducedMotion() ? 'done' : 'wait'
  );

  useEffect(() => {
    if (phase !== 'wait') return;
    heroBuilt = true;
    let cancelled = false;
    // never hold the page for a slow font
    const timeout = new Promise((resolve) => setTimeout(resolve, 600));
    Promise.race([document.fonts.ready, timeout]).then(() => {
      if (!cancelled) setPhase('build');
    });
    return () => {
      cancelled = true;
    };
  }, [phase]);

  return phase;
}

// from the start of the build to the last piece landing (the buttons' fade
// and the work icon's tiles)
const HERO_BUILD_MS = 1900;

/** true once the hero has finished building (straight away if it doesn't) */
function useHeroSettled(phase: 'wait' | 'build' | 'done') {
  const [settled, setSettled] = useState(phase === 'done');
  useEffect(() => {
    if (phase !== 'build') return;
    const timer = window.setTimeout(() => setSettled(true), HERO_BUILD_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);
  return settled;
}

export function HomePage() {
  const { openBooking } = useBooking();
  const heroBuild = useHeroBuild();
  // the work's top row comes in once the headline and buttons have landed
  const heroSettled = useHeroSettled(heroBuild);
  // the work section's eyebrow comes in with the top row of cards
  const [workIn, setWorkIn] = useState(false);
  const showWork = useCallback(() => setWorkIn(true), []);


  return (
    <>
      <PageMeta path='/' />

      <div className='home-page'>
        <div className='home-page-container'>
          <section className='home-page-hero-section'>
            <h1 className={`hero-main-text is-${heroBuild}`}>
              <span className='hero-line'>
                <span className='hero-word is-left' style={{ '--d': '0ms' } as CSSProperties}>Most websites</span>{' '}
                <span className='hero-word is-right' style={{ '--d': '90ms' } as CSSProperties}>blend in<span className='hero-stop'>.</span></span>
              </span>{' '}
              <span className='hero-line'>
                <span className='hero-word is-left' style={{ '--d': '420ms' } as CSSProperties}>Yours</span>{' '}
                <span className='hero-word is-right' style={{ '--d': '510ms' } as CSSProperties}>won't<span className='hero-stop'>.</span></span>
              </span>
              <span className='visually-hidden'> Small business web design in Bath, UK.</span>
            </h1>
            <Reveal as="p" className='hero-sub' delay={heroBuild === 'done' ? 160 : 1000}>
              I obsess over craft and motion. Great websites are just the side effect. See your free homepage mockup before you spend a penny.
            </Reveal>
            <Reveal as="div" className={`hero-action${heroBuild === 'done' ? '' : ' is-building'}`} delay={heroBuild === 'done' ? 240 : 1100}>
              <button type='button' className='hero-action-button hero-cta-pulse' onClick={() => openBooking('Hero')}>
                <p>Get a free mockup</p>
                <GoArrowUpRight aria-hidden />
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
            </Reveal>
          </section>

          <section className='home-work-section'>
            <SectionBar label='Selected work' dot='#6bff91' className='home-work-bar' when={workIn}>
              <Link to='/work' className='home-work-bar-link'>
                View all <GoArrowUpRight aria-hidden />
              </Link>
            </SectionBar>
            <WorkGrid items={workData} hold={!heroSettled} onFirstRowIn={showWork} />
          </section>

          <section className='home-page-info-section'>
            <ServicesType />

            {/* VISUAL: process overview + brand type system */}
            <div className='home-visual-pair'>
              <Reveal as="div" className='home-visual-half'>
                <img
                  src={ProcessCard}
                  alt="Four-step design and development process: Discover, Design, Refine, Deliver"
                  className='home-visual-image'
                />
              </Reveal>
              <Reveal as="div" className='home-visual-half' delay={100}>
                <LoopVideo lazy src={GiosBuildFontsAnimate} poster={GiosBuildFontsPoster} className='home-visual-video' />
              </Reveal>
            </div>

            <div className='process-info-block'>
              <SectionBar label="How we'll work" className='process-bar'>
                <span>04 steps</span>
              </SectionBar>
              <Reveal as="p" className='process-headline' delay={60}>
                <span>Four steps.</span> <span>No surprises.</span>
              </Reveal>
              <Reveal as="p" className='process-subtext' delay={120}>
                From first conversation to launch, you always know what happens next.
              </Reveal>
              <ProcessSteps />
            </div>

            <ResultsLenses />

            <div className='tools-info-block'>
              <Reveal as="p" className='tools-headline' delay={60}>
                <span>New website.</span> <span>Same tools.</span>
              </Reveal>
              <Reveal as="p" className='tools-subtext' delay={120}>
                I build your site around the tools your business already runs on, from Stripe to Shopify.
              </Reveal>
              {/* Two endless rows drifting in opposite directions. Each half of a
                  track holds the row twice so it's always wider than the screen;
                  the track slides by exactly one half, so the loop never shows a seam. */}
              <div className='tools-marquee'>
                {[toolsData.slice(0, 9), toolsData.slice(9)].map((row, rowIndex) => {
                  const half = [...row, ...row];
                  return (
                    <Reveal
                      as="div"
                      key={rowIndex}
                      className={`tools-marquee-row${rowIndex % 2 ? ' is-reverse' : ''}`}
                      delay={rowIndex * 120}
                    >
                      <div className='tools-marquee-track'>
                        {[...half, ...half].map((tool, index) => (
                          <span
                            key={`${tool.name}-${index}`}
                            className='tool-card'
                            aria-hidden={index >= row.length}
                          >
                            <span className='tool-surface'>
                              <ToolIcon tool={tool} />
                              <span className='tool-name'>{tool.name}</span>
                            </span>
                          </span>
                        ))}
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            <Testimonials />

            <StoryStack />

            <section className='home-faq-block'>
              <Reveal as="p" className='home-faq-headline'>
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