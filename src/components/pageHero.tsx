import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { toolsData } from '../data/tools';
import { Reveal } from './reveal';
import { HeroOrb } from './heroOrb';
import './component-styles/pageHero.css';

/**
 * A page's poster hero, the home page's: a centred headline that builds
 * itself in, with an app-icon sticker set into each line, then the subtitle
 * and the buttons. Any page can use it with its own words; the stickers are
 * the same everywhere.
 *
 * Each line is two halves that wrap as units ("Most websites / blend in"),
 * and its sticker sits at the start of the second half.
 */

export interface HeroLine {
  /** the first half: grows in from its left edge */
  left: string;
  /** the second half, after the sticker: grows in from its full stop */
  right: string;
  /** end the line on a full stop (it lands red, then settles); default true */
  stop?: boolean;
}

interface PageHeroProps {
  lines: HeroLine[];
  /** said only to search engines and screen readers, after the headline */
  hidden?: string;
  sub: ReactNode;
  /** the buttons */
  actions: ReactNode;
  /** extra classes for the section, e.g. for the page's own spacing */
  className?: string;
  /** the red orb behind the headline (off for now) */
  orb?: boolean;
  /** once the headline has landed (straight away if it doesn't build) */
  onSettled?: () => void;
}

// Each headline builds itself once per visit: on first load, not every time
// you come back to its page.
const built = new Set<string>();
const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 'wait' hides the headline until its font is in (so it never builds in a
 * fallback font), 'build' plays it, 'done' shows it as it is.
 */
function useHeroBuild(key: string) {
  const [phase, setPhase] = useState<'wait' | 'build' | 'done'>(() =>
    built.has(key) || reducedMotion() ? 'done' : 'wait'
  );

  useEffect(() => {
    if (phase !== 'wait') return;
    built.add(key);
    let cancelled = false;
    // never hold the page for a slow font
    const timeout = new Promise((resolve) => setTimeout(resolve, 600));
    Promise.race([document.fonts.ready, timeout]).then(() => {
      if (!cancelled) setPhase('build');
    });
    return () => {
      cancelled = true;
    };
  }, [phase, key]);

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

// The stickers set into the headline, one at the start of each line's
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
  // the first line's: light and cool, with the blue "+" and the apps people
  // find you on. It opens on the blue face.
  [
    { kind: 'eyes', colour: '#7cc4e4', ink: '#ffffff' },
    { kind: 'plus' },
    { kind: 'app', name: 'Google Business Profile' },
    { kind: 'tile', colour: '#95fc9c' },
    { kind: 'eyes', colour: '#e1ead9', ink: '#1c3b36' },
    { kind: 'app', name: 'Instagram' },
    { kind: 'tile', colour: '#c9b8f5' },
    { kind: 'app', name: 'Shopify' },
    { kind: 'tile', colour: '#ffffff' },
  ],
  // the second line's: deep and warm, with the tick and the apps that bring
  // work in. It opens on the green tick.
  [
    { kind: 'tick' },
    { kind: 'eyes', colour: '#fe432a', ink: '#ffffff' },
    { kind: 'app', name: 'Shopify' },
    { kind: 'tile', colour: '#1c3b36' },
    { kind: 'eyes', colour: '#0d0d0d', ink: '#ffffff' },
    { kind: 'app', name: 'Stripe' },
    { kind: 'tile', colour: '#f7e07a' },
    { kind: 'app', name: 'WhatsApp Business' },
    { kind: 'tile', colour: '#0d0d0d' },
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

function HeroIcon({ faces, turn, turns, play }: { faces: HeroFace[]; turn: number; turns: number; play: boolean }) {
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
      interval = window.setInterval(() => setStep((n) => n + 1), ICON_BEAT_MS * turns);
    }, ICON_BEAT_MS * (turn + 1));
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [play, turn, turns]);

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

// each line starts building a beat after the one above; its second half a
// moment after its first
const LINE_MS = 420;
const HALF_MS = 90;

export function PageHero({ lines, hidden, sub, actions, className = '', orb = false, onSettled }: PageHeroProps) {
  const phase = useHeroBuild(lines.map((line) => `${line.left} ${line.right}`).join(' / '));
  const settled = useHeroSettled(phase);

  useEffect(() => {
    if (settled) onSettled?.();
  }, [settled, onSettled]);

  return (
    <section className={`page-hero ${className}`.trim()}>
      {/* the ring starts drawing as the headline's second line lands */}
      <HeroOrb hidden={!orb} play={phase !== 'wait'} delay={phase === 'build' ? 700 : 0} />
      <h1 className={`hero-main-text is-${phase}`}>
        {lines.map((line, index) => (
          <span key={line.left} className='hero-line'>
            <span className='hero-word is-left' style={{ '--d': `${index * LINE_MS}ms` } as CSSProperties}>{line.left}</span>{' '}
            <span className='hero-word is-right' style={{ '--d': `${index * LINE_MS + HALF_MS}ms` } as CSSProperties}>
              <HeroIcon faces={HERO_ICONS[index % HERO_ICONS.length]} turn={index} turns={lines.length} play={settled} />{' '}
              {line.right}
              {line.stop !== false && <span className='hero-stop'>.</span>}
            </span>{' '}
          </span>
        ))}
        {hidden && <span className='visually-hidden'> {hidden}</span>}
      </h1>
      <Reveal as='p' className='hero-sub' delay={phase === 'done' ? 160 : 1000}>
        {sub}
      </Reveal>
      <Reveal as='div' className={`hero-action${phase === 'done' ? '' : ' is-building'}`} delay={phase === 'done' ? 240 : 1100}>
        {actions}
      </Reveal>
    </section>
  );
}
