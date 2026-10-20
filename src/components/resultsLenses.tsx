import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { resultLenses, trackingLadder, type ResultLens } from '../data/results';
import { Link } from 'react-router-dom';
import { GoArrowUpRight, GoChevronLeft, GoChevronRight } from 'react-icons/go';
import { packagesData, formatPrice } from '../data/packages';
import { Reveal } from './reveal';
import { SectionBar } from './sectionBar';
import { ResultsDashboard } from './resultsDashboard';
import { TechnicalArt } from './serviceArt/technicalArt';
import { ExperienceArt } from './serviceArt/experienceArt';
import { BusinessArt } from './serviceArt/businessArt';
import './component-styles/resultsLenses.css';

const ART = { technical: TechnicalArt, experience: ExperienceArt, business: BusinessArt };
// side by side, each graphic starts a beat after the one to its left
const STAGGER_MS = 350;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The ladder builds itself level by level: the floors draw, the first block
// rises out of every floor, then each level drops onto the pillars that have
// it. Each block lands black (new) and turns grey as the next one lands on
// it, so the black "new" climbs the stairs.
const FLOOR_MS = 450; // the floors and names are in
const LEVEL_MS = 750; // between one level and the next
const PILLAR_MS = 90; // left to right within a level
const LAND_MS = 380; // from a block setting off to it landing
const blockStart = (level: number, pillar: number) => FLOOR_MS + level * LEVEL_MS + pillar * PILLAR_MS;

/** true while the element is well on screen, after `delay` ms */
function usePlaying(delay: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => setPlaying(true), delay);
        else setPlaying(false);
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [delay]);
  return { ref, playing };
}

function Lens({ lens, index }: { lens: ResultLens; index: number }) {
  // stacked on narrow screens, each plays as it arrives, with no wait
  const sideBySide = typeof window !== 'undefined' && window.matchMedia('(min-width: 901px)').matches;
  const { ref, playing } = usePlaying(sideBySide ? index * STAGGER_MS : 0);
  const Art = ART[lens.art];
  return (
    <Reveal
      as="article"
      className={`results-lens${playing ? ' is-playing' : ''}`}
      style={{ backgroundColor: lens.slot }}
      delay={index * 80}
    >
      {/* the words first, then the graphic below them */}
      <div className='results-lens-body'>
        <p className='results-lens-layer'>{lens.layer}</p>
        <h3 className='results-title'>{lens.title}</h3>
        <p className='results-text'>{lens.text}</p>
        <ul className='results-tracks'>
          {lens.tracks.map((track, k) => (
            <li key={track} style={{ '--k': k } as CSSProperties}>{track}</li>
          ))}
        </ul>
      </div>
      <div className='results-slot' ref={ref}>
        <Art active={playing} />
      </div>
    </Reveal>
  );
}

/**
 * The three cards. Side by side on wide screens; on narrow ones a swipeable
 * row that snaps card by card, the next one peeking in, with round
 * previous/next buttons under it.
 */
function LensCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setEdge({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update]);

  // one card along: the gap between the first two cards' left edges
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const cards = track?.querySelectorAll<HTMLElement>('.results-lens');
    if (!track || !cards || cards.length < 2) return;
    const by = cards[1].offsetLeft - cards[0].offsetLeft;
    track.scrollBy({ left: by * direction, behavior: reducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <div className='results-carousel'>
      <div className='results-lenses' ref={trackRef} onScroll={update}>
        {resultLenses.map((lens, i) => <Lens key={lens.layer} lens={lens} index={i} />)}
      </div>
      <div className='results-nav'>
        <button type='button' className='results-nav-button' onClick={() => step(-1)} disabled={edge.start} aria-label='Previous card'>
          <GoChevronLeft aria-hidden />
        </button>
        <button type='button' className='results-nav-button' onClick={() => step(1)} disabled={edge.end} aria-label='Next card'>
          <GoChevronRight aria-hidden />
        </button>
      </div>
    </div>
  );
}

/**
 * "How we'll know": the three layers every project is measured on, as
 * portrait colour cards each playing its own line-work graphic while it's on
 * screen, then the packages as a ladder of pillars, each stacking one more
 * block of tracking on the one before.
 */
export function ResultsLenses() {
  return (
    <section className='results-block'>
      <SectionBar label="How we'll know" className='results-bar'>
        <span>{String(resultLenses.length).padStart(2, '0')} layers</span>
      </SectionBar>

      <Reveal as="h2" className='results-headline'>
        <span>Tracked from</span> <span>day one.</span>
      </Reveal>
      <Reveal as="p" className='results-subtext' delay={60}>
        Most websites go live and nobody looks again. Yours is measured three ways, so it keeps getting better.
      </Reveal>

      <LensCarousel />

      {/* the tier bars, poster-sized: each package is a pillar of blocks,
          and each one up the ladder stacks a new block of tracking on top */}
      <div className='results-ladder'>
        <Reveal as="p" className='results-ladder-title'>
          <span>On every package.</span> <span>Bigger builds go deeper.</span>
        </Reveal>
        <Reveal as="div" className='results-pillars' threshold={0.3}>
          {packagesData.map((pkg, index) => (
            <div key={pkg.id} className='results-pillar' style={{ '--p': index } as CSSProperties}>
              <div className='results-blocks'>
                {trackingLadder.slice(0, index + 1).map((block, k) => (
                  <div
                    key={block.adds}
                    className={`results-block-item${k === 0 ? ' is-floor' : ''}${k === index ? ' is-new' : ' will-dim'}`}
                    style={{ '--d': `${blockStart(k, index)}ms`, '--dim': `${blockStart(k + 1, index) + LAND_MS}ms` } as CSSProperties}
                  >
                    <span className='results-block-adds'>{block.adds}</span>
                    <span className='results-block-detail'>{block.detail}</span>
                  </div>
                ))}
              </div>
              {/* the package itself, as the pillar's base: tier bars, name and
                  price, like a row of the package list, linking to it */}
              <Link to='/packages' className='results-pillar-base'>
                <span className='results-pillar-bars' aria-hidden>
                  {packagesData.map((_, bar) => (
                    <i key={bar} className={bar <= index ? 'is-on' : ''} style={{ '--b': bar } as CSSProperties} />
                  ))}
                </span>
                <span className='results-pillar-name'>{pkg.name}</span>
                <span className='results-pillar-price'>
                  From {formatPrice(pkg.from)}
                  <GoArrowUpRight aria-hidden />
                </span>
              </Link>
            </div>
          ))}
        </Reveal>
      </div>

      <ResultsDashboard />
    </section>
  );
}
