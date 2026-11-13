import { useCallback, useEffect, useRef, useState } from 'react';
import { resultLenses, trackingPoints, type ResultLens, type TrackingIcon } from '../data/results';
import type { IconType } from 'react-icons';
import { GoCalendar, GoChevronLeft, GoChevronRight, GoFilter, GoGraph, GoHistory, GoInbox, GoZap } from 'react-icons/go';
import { Reveal } from './reveal';
import { ResultsDashboard } from './resultsDashboard';
import { BuiltRightIcon, GrowthIcon, TapIcon } from './resultsIcons';
import './component-styles/resultsLenses.css';

const ART = { technical: BuiltRightIcon, experience: TapIcon, business: GrowthIcon };
// side by side, each card's pills fill a beat after the one to its left
const STAGGER_MS = 350;
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const POINT_ICON: Record<TrackingIcon, IconType> = {
  dashboard: GoGraph,
  speed: GoZap,
  review: GoCalendar,
  before: GoHistory,
  enquiry: GoInbox,
  dropoff: GoFilter,
};

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
      delay={index * 80}
    >
      {/* the words first, then the graphic below them */}
      <div className='results-lens-body'>
        <h3 className='results-title'>{lens.title}</h3>
        <p className='results-text'>{lens.text}</p>
      </div>
      {/* the graphic, on its own panel in the card's colour */}
      <div className='results-slot' ref={ref} style={{ backgroundColor: lens.slot }}>
        <Art />
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
        {resultLenses.map((lens, i) => <Lens key={lens.title} lens={lens} index={i} />)}
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
 * "Tracked from day one": the three layers every project is measured on, as
 * portrait colour cards each playing its own line-work graphic while it's on
 * screen. Not on any page right now (taken off the home page in November
 * 2026), but kept, with its graphics, to use somewhere else later.
 */
export function TrackedFromDayOne() {
  return (
    <section className='results-block'>
      <Reveal as="h2" className='results-headline'>
        <span>Tracked from</span> <span>day one.</span>
      </Reveal>
      <Reveal as="p" className='results-subtext' delay={60}>
        Most websites go live and nobody looks again. Yours is measured three ways, so it keeps getting better.
      </Reveal>

      <LensCarousel />
    </section>
  );
}

/**
 * What gets tracked, one point to a card, then the client dashboard.
 */
export function ResultsLenses() {
  return (
    <section className='results-block'>
      {/* what gets tracked, one point to a card, after Mobbin's prompt cards */}
      <div className='results-ladder'>
        <Reveal as="h2" className='results-ladder-title'>
          <span>On every package.</span> <span>Bigger builds go deeper.</span>
        </Reveal>
        <div className='results-points'>
          {trackingPoints.map((point, i) => {
            const Icon = POINT_ICON[point.icon];
            return (
              <Reveal key={point.text} as="article" className='results-point' delay={i * 60}>
                <p className='results-point-text'>{point.text}</p>
                <Icon className='results-point-icon' aria-hidden />
              </Reveal>
            );
          })}
        </div>
      </div>

      <ResultsDashboard />
    </section>
  );
}
