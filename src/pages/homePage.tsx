import { useEffect, useState, type CSSProperties } from 'react';
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
import { HeroOrb } from '../components/heroOrb';


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

// The two stickers set into the headline, one at the start of each line's
// second half, so they grow in with its words and wrap with them. They take
// turns: every three seconds one of them changes, the first, then the second,
// then the first again. Each runs through faces of its own: plain colour
// tiles, a little character with eyes (like the closing call's stickers), a
// symbol, and the app icons a good small-business site plugs into. The first
// stays light and cool, the second deep and warm, so the two never match.
const ICON_BEAT_MS = 3000;

type HeroFace =
  | { kind: 'tile'; colour: string }
  | { kind: 'eyes'; colour: string; ink: string }
  | { kind: 'plus' }
  | { kind: 'tick' }
  | { kind: 'app'; name: string };

const HERO_ICONS: HeroFace[][] = [
  // "blend in": light and cool, with the blue "+" and the apps people find you on
  [
    { kind: 'tile', colour: '#ffffff' },
    { kind: 'eyes', colour: '#7cc4e4', ink: '#ffffff' },
    { kind: 'plus' },
    { kind: 'app', name: 'Google Business Profile' },
    { kind: 'tile', colour: '#95fc9c' },
    { kind: 'eyes', colour: '#e1ead9', ink: '#1c3b36' },
    { kind: 'app', name: 'Instagram' },
    { kind: 'tile', colour: '#c9b8f5' },
    { kind: 'app', name: 'Shopify' },
  ],
  // "won't": deep and warm, with the tick and the apps that bring work in
  [
    { kind: 'tile', colour: '#0d0d0d' },
    { kind: 'tick' },
    { kind: 'eyes', colour: '#fe432a', ink: '#ffffff' },
    { kind: 'app', name: 'Shopify' },
    { kind: 'tile', colour: '#1c3b36' },
    { kind: 'eyes', colour: '#0d0d0d', ink: '#ffffff' },
    { kind: 'app', name: 'Stripe' },
    { kind: 'tile', colour: '#f7e07a' },
    { kind: 'app', name: 'WhatsApp Business' },
  ],
];

// the tile colour behind each face (the colour change rides the dip)
function faceTile(face: HeroFace) {
  switch (face.kind) {
    case 'tile':
    case 'eyes':
      return face.colour;
    case 'plus':
      return '#0a7cff';
    case 'tick':
      return '#22c55e';
    case 'app':
      return toolsData.find((tool) => tool.name === face.name)?.app.tile ?? '#ffffff';
  }
}

function FaceMark({ face }: { face: HeroFace }) {
  if (face.kind === 'eyes') {
    return (
      <span className='hero-icon-eyes' style={{ '--ink': face.ink } as CSSProperties}>
        <i />
        <i />
      </span>
    );
  }
  if (face.kind === 'plus') {
    return (
      <svg className='hero-icon-mark' viewBox='0 0 24 24'>
        <path d='M12 6v12M6 12h12' stroke='#fff' strokeWidth='2.8' strokeLinecap='round' />
      </svg>
    );
  }
  if (face.kind === 'tick') {
    return (
      <svg className='hero-icon-mark' viewBox='0 0 24 24'>
        <path d='M6.5 12.5l3.6 3.6 7.4-8' fill='none' stroke='#fff' strokeWidth='2.8' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    );
  }
  if (face.kind === 'app') {
    const tool = toolsData.find((t) => t.name === face.name);
    if (!tool) return null;
    return (
      <svg className='hero-icon-mark is-app' viewBox={tool.viewBox ?? '0 0 24 24'}>
        {/* a mark in several colours (Google's) keeps its own */}
        {tool.paths
          ? tool.paths.map((part) => <path key={part.d} d={part.d} fill={part.fill} />)
          : tool.path && <path d={tool.path} fill={tool.app.mark ?? tool.color} />}
      </svg>
    );
  }
  return null;
}

function HeroIcon({ faces, turn, play }: { faces: HeroFace[]; turn: number; play: boolean }) {
  const [step, setStep] = useState(0);
  // what's drawn on the tile: it changes a beat after the step, at the
  // bottom of the dip, as the tile is smallest
  const [shown, setShown] = useState(0);

  // once the headline has built: a new face on its own beat, then again
  // each time its turn comes round
  useEffect(() => {
    if (!play || reducedMotion()) return;
    let interval = 0;
    const first = window.setTimeout(() => {
      setStep((n) => n + 1);
      interval = window.setInterval(() => setStep((n) => n + 1), ICON_BEAT_MS * HERO_ICONS.length);
    }, ICON_BEAT_MS * (turn + 1));
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [play, turn]);

  useEffect(() => {
    if (step === 0) return;
    const timer = window.setTimeout(() => setShown(step), 180);
    return () => window.clearTimeout(timer);
  }, [step]);

  const face = faces[shown % faces.length];
  const round = face.kind === 'plus' || face.kind === 'tick';
  // two copies of the same dip-and-pop, swapped each time, so it replays
  const swap = step === 0 ? '' : step % 2 ? ' is-swap-a' : ' is-swap-b';
  // a gradient tile (Instagram's) is laid over a solid colour from it
  const tile = faceTile(face);
  const gradient = tile.startsWith('linear-gradient');
  const style = { '--tile': gradient ? '#d62976' : tile, '--tile-image': gradient ? tile : undefined } as CSSProperties;
  return (
    <span className={`hero-icon is-${face.kind}${round ? ' is-round' : ''}${swap}`} style={style} aria-hidden>
      {/* keyed, so a new face mounts fresh and plays its grow-in */}
      <FaceMark key={shown} face={face} />
    </span>
  );
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


  return (
    <>
      <PageMeta path='/' />

      <div className='home-page'>
        <div className='home-page-container'>
          <section className='home-page-hero-section'>
            {/* the ring starts drawing as the headline's second line lands */}
            {/* hidden for now: drop `hidden` to bring the orb back */}
            <HeroOrb hidden play={heroBuild !== 'wait'} delay={heroBuild === 'build' ? 700 : 0} />
            <h1 className={`hero-main-text is-${heroBuild}`}>
              <span className='hero-line'>
                <span className='hero-word is-left' style={{ '--d': '0ms' } as CSSProperties}>Most websites</span>{' '}
                <span className='hero-word is-right' style={{ '--d': '90ms' } as CSSProperties}><HeroIcon faces={HERO_ICONS[0]} turn={0} play={heroSettled} />{' '}blend in<span className='hero-stop'>.</span></span>
              </span>{' '}
              <span className='hero-line'>
                <span className='hero-word is-left' style={{ '--d': '420ms' } as CSSProperties}>Yours</span>{' '}
                <span className='hero-word is-right' style={{ '--d': '510ms' } as CSSProperties}><HeroIcon faces={HERO_ICONS[1]} turn={1} play={heroSettled} />{' '}won't<span className='hero-stop'>.</span></span>
              </span>
              <span className='visually-hidden'> Web design for small businesses in Bath, Bristol and across the UK.</span>
            </h1>
            <Reveal as="p" className='hero-sub' delay={heroBuild === 'done' ? 160 : 1000}>
              Built around your customers: what they're looking for, and what makes them pick you. See your free homepage mockup before you spend a penny.
            </Reveal>
            <Reveal as="div" className={`hero-action${heroBuild === 'done' ? '' : ' is-building'}`} delay={heroBuild === 'done' ? 240 : 1100}>
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
            </Reveal>
          </section>

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