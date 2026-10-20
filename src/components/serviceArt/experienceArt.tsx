import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 150 box, espresso line work on fresh green ----
const INK = '#3b2a1f';
const SLOT = '#95fc9c';

// a visitor's route to getting in touch: the long way round, then the short
// shifted so the route and its button, together, sit centred
const START = { x: 36, y: 100 };
const END = { x: 160, y: 52 };
const DETOURS = [
  { x: 72, y: 40 },
  { x: 118, y: 112 },
];
// where the detours end up: on the straight line, a third and two thirds along
const ON_LINE = [1 / 3, 2 / 3].map((k) => ({ x: lerp(START.x, END.x, k), y: lerp(START.y, END.y, k) }));
const BUTTON = { w: 40, h: 22 };

const route = (k: number) => {
  const [a, b] = DETOURS.map((p, i) => ({ x: lerp(p.x, ON_LINE[i].x, k), y: lerp(p.y, ON_LINE[i].y, k) }));
  return { a, b, d: `M ${START.x} ${START.y} L ${a.x} ${a.y} L ${b.x} ${b.y} L ${END.x} ${END.y}` };
};

const DURATION = 3.3;

/**
 * Experience: "easy to use". A zigzag route draws from the visitor to a
 * contact button, with a stop at each turn; the route then pulls straight,
 * the stops melt away, the button opens and a dot runs straight to it.
 * Fewer taps, less to figure out.
 */
export function ExperienceArt({ active }: { active: boolean }) {
  const refs = useRef<{
    path: SVGPathElement | null;
    start: SVGCircleElement | null;
    stops: (SVGCircleElement | null)[];
    button: SVGPathElement | null;
    runner: SVGCircleElement | null;
    check: SVGPathElement | null;
  }>({ path: null, start: null, stops: [], button: null, runner: null, check: null });

  const svg = useArtTimeline(active, DURATION, (t) => {
    const parts = refs.current;
    parts.start?.setAttribute('r', String(6 * settle(span(t, 0.05, 0.35))));

    // beat 1: the long way round draws on, a stop appearing at each turn
    const straighten = easeInOut(span(t, 1.3, 2.0));
    const { a, b, d } = route(straighten);
    const path = parts.path;
    if (path) {
      path.setAttribute('d', d);
      if (t < 1.3) drawOn(path, easeInOut(span(t, 0.2, 1.1)));
      else {
        path.style.strokeDasharray = 'none';
        path.style.opacity = '1';
      }
    }
    [a, b].forEach((p, i) => {
      const stop = parts.stops[i];
      if (!stop) return;
      const appear = settle(span(t, 0.45 + i * 0.25, 0.7 + i * 0.25));
      // beat 2: the stops melt away as the route pulls straight
      const melt = easeInOut(span(t, 1.7, 2.1));
      stop.setAttribute('cx', String(p.x));
      stop.setAttribute('cy', String(p.y));
      stop.setAttribute('r', String(Math.max(0, 5 * appear * (1 - melt))));
    });

    // beat 3: the end opens into a button and a dot runs straight to it
    const open = settle(span(t, 0.9, 1.3));
    parts.button?.setAttribute('d', capsule(END.x, END.y, lerp(10, BUTTON.w, open), lerp(10, BUTTON.h, open)));
    if (parts.button) parts.button.style.opacity = String(span(t, 0.85, 0.95));
    if (parts.runner) {
      const run = easeInOut(span(t, 2.1, 2.65));
      const arrived = span(t, 2.6, 2.75);
      parts.runner.setAttribute('cx', String(lerp(START.x, END.x - BUTTON.w / 2, run)));
      parts.runner.setAttribute('cy', String(lerp(START.y, END.y + 3, run)));
      parts.runner.style.opacity = String(span(t, 2.05, 2.15) * (1 - arrived));
    }
    drawOn(parts.check, easeInOut(span(t, 2.65, 3.05)));
  });

  const r = refs.current;
  const tick = `M ${END.x - 6} ${END.y + 0.4} L ${END.x - 1.8} ${END.y + 4.4} L ${END.x + 6.2} ${END.y - 4}`;
  return (
    <svg className='lens-art' ref={svg} viewBox='0 0 210 150' aria-hidden>
      <path ref={(el) => { r.path = el; }} d={route(0).d} fill='none' stroke={INK} strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
      {DETOURS.map((p, i) => (
        <circle key={i} ref={(el) => { r.stops[i] = el; }} cx={p.x} cy={p.y} r='0' fill={SLOT} stroke={INK} strokeWidth='3.5' />
      ))}
      <circle ref={(el) => { r.start = el; }} cx={START.x} cy={START.y} r='0' fill={INK} />
      <path ref={(el) => { r.button = el; }} fill={INK} opacity='0' />
      <circle ref={(el) => { r.runner = el; }} cx={START.x} cy={START.y} r='5' fill={INK} stroke={SLOT} strokeWidth='2.5' paintOrder='stroke' opacity='0' />
      <path ref={(el) => { r.check = el; }} d={tick} fill='none' stroke={SLOT} strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
