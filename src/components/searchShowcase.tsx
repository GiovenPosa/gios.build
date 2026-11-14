import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { workData } from '../data/work';
import { Reveal } from './reveal';
import PrimeStockDesktop from '../assets/project-images/primestock-desktop.webp';
import OssaSeen from '../assets/project-images/mobile/ossa-2-seen.webp';
import KapeNewOnMenu from '../assets/project-images/mobile/kape-3-new-on-menu.webp';
import KapeOurMenu from '../assets/project-images/mobile/kape-4-our-menu.webp';
import PrimeStockAlwaysOn from '../assets/project-images/mobile/primestock-2-always-on.webp';
import OssaNew from '../assets/project-images/services/ossa-3-new.webp';
import PrimeStockQuote from '../assets/project-images/services/primestock-6-quote-form.webp';
import './component-styles/searchShowcase.css';

// The words. The headline in ink, the line after it in grey at the same
// size, then the "search" above the row of work: each one types itself out
// after a blinking cursor, holds for three seconds, erases, and the next types in.
const HEADLINE = ["You don't need a fancier website.", 'You need one that brings in work.'];
const LINES = ['Clear, quick and made for the people', 'you actually serve,', 'so the right ones get in touch.'];
const QUERIES = [
  'Websites that win work',
  'Booking systems',
  'Enquiry forms that convert',
  'Found on Google',
  'Fast on every phone',
  'Dashboards you’ll use',
];
const TYPE_MS = 60; // per letter, typing
const ERASE_MS = 28; // per letter, erasing
const HOLD_MS = 3000; // the finished search, before it's erased
const GAP_MS = 350; // the empty box, before the next one types

// The work, as stills, desktop and mobile mixed: each desktop card is the
// project's reel's first frame (16:10), each mobile card a phone screenshot
// in a narrower 3:4 card, showing the top of the screen. One desktop, then
// two phones, and never the same project twice in a row.
type Card = { title: string; ratio: string; icon?: string; src: string };
const MOBILE_RATIO = '3 / 4';
const desktop = (title: string, still?: string): Card => {
  const item = workData.find((w) => w.title === title)!;
  return { title, ratio: '16 / 10', icon: item.icon, src: still ?? item.media.poster ?? item.media.src };
};
const mobile = (title: string, src: string): Card => ({ title, ratio: MOBILE_RATIO, icon: workData.find((w) => w.title === title)!.icon, src });
const CARDS: Card[] = [
  // its reel opens on the hero still fading in, so a settled frame instead
  desktop('Prime Stock Central', PrimeStockDesktop),
  mobile('Ossa Pilates', OssaSeen),
  mobile('Kape Coffee', KapeNewOnMenu),
  desktop('Ossa Pilates'),
  mobile('Prime Stock Central', PrimeStockQuote),
  mobile('Kape Coffee', KapeOurMenu),
  desktop('Kape Coffee'),
  mobile('Prime Stock Central', PrimeStockAlwaysOn),
  mobile('Ossa Pilates', OssaNew),
];

// one set of the row must be wider than the widest screen, or the loop shows
// a gap: with only a few cards, the set repeats them until it's six long
const MIN_SET = 6;
const SET = Array.from({ length: Math.max(CARDS.length, Math.ceil(MIN_SET / Math.max(1, CARDS.length)) * CARDS.length) }, (_, i) => CARDS[i % CARDS.length]);

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The search glyph: a magnifier with a small spark at its shoulder. Keyed
 * to the search, so each new one replays its little look: the magnifier
 * swings and the spark pops.
 */
function SearchSpark() {
  return (
    <svg className='showcase-query-icon' viewBox='0 0 48 48' aria-hidden>
      <g className='showcase-query-lens'>
        <circle cx='20' cy='24' r='13' fill='none' stroke='currentColor' strokeWidth='4.5' />
        <path d='M 29.5 33.5 L 40 44' stroke='currentColor' strokeWidth='4.5' strokeLinecap='round' />
      </g>
      <path className='showcase-query-spark' d='M 36 2 C 36.6 7.4 37.6 8.4 43 9 C 37.6 9.6 36.6 10.6 36 16 C 35.4 10.6 34.4 9.6 29 9 C 34.4 8.4 35.4 7.4 36 2 Z' fill='currentColor' />
    </svg>
  );
}

/**
 * Before the services: the problem in two big lines (ink, then grey), then
 * a "search" typing itself out and erasing, and a row of the work drifting past
 * underneath it, edge to edge. Each card is a project's still on a grey
 * card, its favicon tucked into the corner like an app icon (or, without
 * one, its initial on a black tile).
 */
interface SearchShowcaseProps {
  /** the two big lines; the home page's by default */
  headline?: string[];
  /** the grey lines under them */
  lines?: string[];
  /** the searches that type themselves out */
  queries?: string[];
}

export function SearchShowcase({ headline = HEADLINE, lines = LINES, queries = QUERIES }: SearchShowcaseProps = {}) {
  const ref = useRef<HTMLHeadingElement>(null);
  // which search, how many of its letters show, and whether the cursor is
  // busy (typing or erasing, when it holds solid instead of blinking). With
  // motion off, the first search simply sits there in full.
  const [step, setStep] = useState(0);
  const [shown, setShown] = useState(() => (reducedMotion() ? queries[0].length : 0));
  const [busy, setBusy] = useState(false);

  // type, hold, erase, next: one timer at a time, only while on screen
  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let timer = 0;
    let index = 0;
    let count = 0;
    let phase: 'type' | 'hold' | 'erase' | 'gap' = 'gap';

    const tick = () => {
      const length = queries[index % queries.length].length;
      if (phase === 'type') {
        count += 1;
        setShown(count);
        if (count >= length) {
          phase = 'hold';
          setBusy(false);
          timer = window.setTimeout(tick, HOLD_MS);
        } else timer = window.setTimeout(tick, TYPE_MS);
      } else if (phase === 'hold') {
        phase = 'erase';
        setBusy(true);
        timer = window.setTimeout(tick, ERASE_MS);
      } else if (phase === 'erase') {
        count -= 1;
        setShown(count);
        if (count <= 0) {
          phase = 'gap';
          setBusy(false);
          index += 1;
          timer = window.setTimeout(tick, GAP_MS);
        } else timer = window.setTimeout(tick, ERASE_MS);
      } else {
        // the next search starts: the glyph does its look, the letters come
        phase = 'type';
        setStep(index);
        setBusy(true);
        timer = window.setTimeout(tick, TYPE_MS);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      window.clearTimeout(timer);
      if (entry.isIntersecting) timer = window.setTimeout(tick, phase === 'gap' ? GAP_MS : TYPE_MS);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
    // pass `queries` as a constant, or this restarts on every render
  }, [queries]);

  const query = queries[step % queries.length];

  // the row holds the set twice, and slides by exactly one set, so the
  // loop never shows a seam
  const row = [...SET, ...SET];

  return (
    <section className='showcase' aria-labelledby='showcase-title'>
      <div className='showcase-copy'>
        <Reveal as='h2' className='showcase-headline' id='showcase-title'>
          {headline.map((line) => <span key={line}>{line}</span>)}
        </Reveal>
        <Reveal as='p' className='showcase-lines' delay={80}>
          {lines.map((line) => <span key={line}>{line} </span>)}
        </Reveal>

        {/* read out once, as the whole list, rather than every two seconds */}
        <h3 className='showcase-query' ref={ref} aria-label={queries.join(', ')}>
          <SearchSpark key={step} />
          {/* the letters so far, then the text cursor after them */}
          <span className='showcase-query-words' aria-hidden>
            {query.slice(0, shown)}
            <span className={`showcase-caret${busy ? ' is-busy' : ''}`} />
          </span>
        </h3>
      </div>

      <div className='showcase-row' aria-hidden>
        <div className='showcase-track'>
          {row.map((card, index) => (
            <div key={`${card.title}-${index}`} className='showcase-card' style={{ '--ratio': card.ratio } as CSSProperties}>
              {/* described for image search; the row itself is hidden from screen readers */}
              <img className='showcase-shot' src={card.src} alt={`${card.title} website${card.ratio === MOBILE_RATIO ? ' on a phone' : ''}, by gios.build`} loading='lazy' decoding='async' />
              {card.icon ? (
                <img className='showcase-mark' src={card.icon} alt='' loading='lazy' decoding='async' />
              ) : (
                <span className='showcase-mark'>{card.title.charAt(0)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
