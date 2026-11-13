import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './component-styles/ctaStickers.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- the stickers: little bits of interface, and blob characters ----

/** A blob with eyes. Its eyes blink now and then and look towards the cursor. */
function Blob({ shape, color, ink = '#fff', blink }: { shape: 'circle' | 'square' | 'triangle' | 'squircle' | 'pebble'; color: string; ink?: string; blink: number }) {
  return (
    <span className={`stk-blob is-${shape}`} style={{ '--blob': color, '--ink': ink, '--blink-delay': `${blink}s` } as CSSProperties}>
      {shape === 'triangle' && (
        <svg className='stk-blob-shape' viewBox='0 0 100 92' aria-hidden>
          <path d='M43 6.5c3.1-5.4 10.9-5.4 14 0l40 69.3c3.1 5.4-.8 12.2-7 12.2H10c-6.2 0-10.1-6.8-7-12.2z' fill='currentColor' />
        </svg>
      )}
      <span className='stk-eyes'>
        <i />
        <i />
      </span>
    </span>
  );
}

const PlusButton = () => (
  <span className='stk-plus'>
    <span className='stk-plus-button'>
      <svg viewBox='0 0 24 24' aria-hidden>
        <path d='M12 5v14M5 12h14' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' />
      </svg>
    </span>
    <svg className='stk-cursor' viewBox='0 0 24 24' aria-hidden>
      <path d='M5 2.5v17.2l4.6-4.4 3 6.6 3.1-1.4-3-6.4H19z' fill='#111' stroke='#fff' strokeWidth='1.6' strokeLinejoin='round' />
    </svg>
  </span>
);

const Toggle = () => (
  <span className='stk-toggle'>
    <svg viewBox='0 0 24 24' aria-hidden>
      <path d='M6 12.5l4 4 8-9' fill='none' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  </span>
);

const Notification = () => (
  <span className='stk-card stk-note'>
    <i className='stk-note-dot' />
    <span className='stk-note-text'>
      <b>New enquiry</b>
      <small>Kitchen refit · just now</small>
    </span>
  </span>
);

const Stars = () => (
  <span className='stk-card stk-stars'>
    <span className='stk-stars-row'>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox='0 0 24 24' aria-hidden>
          <path d='M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z' fill='#fbbc05' />
        </svg>
      ))}
    </span>
    <b>5.0</b>
  </span>
);

const Booked = () => (
  <span className='stk-card stk-booked'>
    <span className='stk-booked-check'>
      <svg viewBox='0 0 24 24' aria-hidden>
        <path d='M6.5 12.5l3.5 3.5 7.5-8' fill='none' stroke='#fff' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' />
      </svg>
    </span>
    <span>
      <b>Booked</b> Tue 10:00
    </span>
  </span>
);

const Search = () => (
  <span className='stk-card stk-search'>
    <svg viewBox='0 0 24 24' aria-hidden>
      <circle cx='10.5' cy='10.5' r='6' fill='none' stroke='currentColor' strokeWidth='2.2' />
      <path d='M15 15l5 5' stroke='currentColor' strokeWidth='2.2' strokeLinecap='round' />
    </svg>
    <span>
      Plumber near me<i className='stk-caret' />
    </span>
  </span>
);

// Where each one lands. x is a share of the stickers' layer, which is wider
// than the page's content (see ctaStickers.css), y is px from the section's top
// (the headline's band, about 260 to 440, is kept clear). `roam` is how far
// it wanders from there either way, x and y in px: wide where there's open
// space, tighter beside the headline and the buttons. `phone` is the same as
// x/y for phones and tablets, where only those five stay, in the space
// above the headline.
interface Sticker {
  key: string;
  node: ReactNode;
  x: number;
  y: number;
  tilt: number;
  roam: [number, number];
  phone?: { x: number; y: number };
  blob?: boolean;
}

const STICKERS: Sticker[] = [
  // left
  { key: 'blob-blue', node: <Blob shape='circle' color='#7cc4e4' blink={0.4} />, x: 6, y: 110, tilt: -8, roam: [45, 45], blob: true, phone: { x: 9, y: 4 } },
  { key: 'plus', node: <PlusButton />, x: 17, y: 150, tilt: 0, roam: [50, 28], phone: { x: 31, y: 34 } },
  { key: 'toggle', node: <Toggle />, x: 8, y: 480, tilt: -6, roam: [40, 50] },
  { key: 'blob-red', node: <Blob shape='triangle' color='#fe432a' blink={2.1} />, x: 21, y: 550, tilt: 8, roam: [70, 45], blob: true },
  { key: 'search', node: <Search />, x: 9, y: 620, tilt: -3, roam: [35, 30] },
  // right
  { key: 'note', node: <Notification />, x: 74, y: 100, tilt: 4, roam: [70, 30], phone: { x: 60, y: -6 } },
  { key: 'blob-green', node: <Blob shape='square' color='#95fc9c' ink='#1c3b36' blink={1.3} />, x: 93, y: 175, tilt: 10, roam: [40, 70], blob: true, phone: { x: 91, y: 22 } },
  { key: 'stars', node: <Stars />, x: 79, y: 205, tilt: -4, roam: [55, 22] },
  { key: 'booked', node: <Booked />, x: 74, y: 500, tilt: 3, roam: [30, 30] },
  { key: 'blob-black', node: <Blob shape='squircle' color='#111' blink={3.2} />, x: 93, y: 500, tilt: -8, roam: [35, 50], blob: true },
  { key: 'blob-sand', node: <Blob shape='pebble' color='#dfd5cb' ink='#39251c' blink={2.7} />, x: 81, y: 625, tilt: 6, roam: [55, 28], blob: true, phone: { x: 70, y: 46 } },
];

// ---- motion ----
const POP_MS = 900;
const POP_STAGGER_MS = 70;
const FLOAT_DEG = 6; // how far each tilts either way as it wanders
const PHONE_ROAM = 0.35; // phones and tablets: a smaller share of each roam, as space is tight
const LOOK_PX = 3; // how far the blobs' eyes look towards the cursor

// a seeded random per sticker, so each wanders its own way, the same way
// every time
const seeded = (i: number, k: number) => {
  const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/**
 * The stickers round "Let's build yours": little bits of interface and
 * blob characters. Once `play` turns true (the headline has locked in) each
 * pops out from the headline's middle to its own spot, one after another,
 * with a little overshoot; then it wanders round its own area on a slow
 * path of its own. The blobs blink and look towards the cursor. Decorative only.
 */
export function CtaStickers({ play }: { play: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const pops = useRef<(HTMLSpanElement | null)[]>([]);
  const floats = useRef<(HTMLSpanElement | null)[]>([]);
  const landed = useRef(false);

  // the pop: from the middle of the headline out to each spot
  useEffect(() => {
    const box = layer.current;
    if (!play || !box || landed.current) return;
    landed.current = true;
    box.classList.add('is-out');
    if (reducedMotion()) return;
    const title = box.parentElement?.querySelector('.cta-title');
    const from = (title ?? box).getBoundingClientRect();
    const originX = from.left + from.width / 2;
    const originY = from.top + from.height / 2;
    // nearest first, so they spill outwards
    const order = pops.current
      .map((el, i) => ({ el, i, d: el ? Math.hypot(el.getBoundingClientRect().left - originX, el.getBoundingClientRect().top - originY) : 0 }))
      .sort((a, b) => a.d - b.d);
    order.forEach(({ el }, rank) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = originX - (r.left + r.width / 2);
      const dy = originY - (r.top + r.height / 2);
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: 'none', opacity: 1 },
        ],
        { duration: POP_MS, delay: rank * POP_STAGGER_MS, easing: 'cubic-bezier(0.34, 1.45, 0.64, 1)', fill: 'backwards' }
      );
    });
  }, [play]);

  // the float, and the blobs' eyes, while the section is on screen
  useEffect(() => {
    const box = layer.current;
    if (!box || reducedMotion()) return;
    let frame = 0;
    let running = false;
    let pointer: { x: number; y: number } | null = null;
    const start = performance.now();
    // slow, so the wider wandering stays calm
    const paths = STICKERS.map((_, i) => ({
      w1: 0.16 + seeded(i, 1) * 0.12,
      w2: 0.37 + seeded(i, 2) * 0.2,
      w3: 0.2 + seeded(i, 3) * 0.15,
      p1: seeded(i, 4) * Math.PI * 2,
      p2: seeded(i, 5) * Math.PI * 2,
      p3: seeded(i, 6) * Math.PI * 2,
      p4: seeded(i, 7) * Math.PI * 2,
    }));

    const narrow = window.matchMedia('(max-width: 900px)');
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      const share = narrow.matches ? PHONE_ROAM : 1;
      floats.current.forEach((el, i) => {
        if (!el) return;
        const { w1, w2, w3, p1, p2, p3, p4 } = paths[i];
        // two sines per axis at unrelated speeds: a path that never quite
        // repeats and reaches all over the sticker's area
        const [rx, ry] = STICKERS[i].roam;
        const x = rx * share * (0.65 * Math.sin(t * w1 + p1) + 0.35 * Math.sin(t * w2 + p2));
        const y = ry * share * (0.65 * Math.cos(t * w1 * 0.9 + p3) + 0.35 * Math.sin(t * w2 * 1.1 + p4));
        const turn = FLOAT_DEG * Math.sin(t * w3 + p2);
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${turn.toFixed(2)}deg)`;
        // the blobs look towards the cursor
        const eyes = STICKERS[i].blob ? (el.querySelector('.stk-eyes') as HTMLElement | null) : null;
        if (eyes) {
          let ex = 0;
          let ey = 0;
          if (pointer) {
            const r = el.getBoundingClientRect();
            const dx = pointer.x - (r.left + r.width / 2);
            const dy = pointer.y - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy) || 1;
            const reach = Math.min(1, d / 160);
            ex = (dx / d) * LOOK_PX * reach;
            ey = (dy / d) * LOOK_PX * reach;
          }
          eyes.style.transform = `translate(${ex.toFixed(2)}px, ${ey.toFixed(2)}px)`;
        }
      });
      if (running) frame = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(tick);
    });
    observer.observe(box);
    window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <div className='cta-stickers' ref={layer} aria-hidden>
      {STICKERS.map((sticker, i) => (
        <span
          key={sticker.key}
          className={`cta-sticker${sticker.phone ? '' : ' is-wide-only'}`}
          style={
            {
              '--x': `${sticker.x}%`,
              '--y': `${sticker.y}px`,
              '--tilt': `${sticker.tilt}deg`,
              '--mx': `${sticker.phone?.x ?? 0}%`,
              '--my': `${sticker.phone?.y ?? 0}px`,
            } as CSSProperties
          }
        >
          <span className='cta-sticker-pop' ref={(el) => { pops.current[i] = el; }}>
            <span className='cta-sticker-float' ref={(el) => { floats.current[i] = el; }}>
              <span className='cta-sticker-tilt'>{sticker.node}</span>
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
