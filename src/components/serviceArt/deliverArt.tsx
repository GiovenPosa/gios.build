import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Light mint line on deep forest ----
const LINE = '#e7f1ec';

// the progress bar, and the fill that runs along inside it (kept inside
// x 50 to 160, the part of the drawing the card shows)
const BAR = { x: 62, y: 50, w: 62, h: 16 };
const INSET = 4.5;
const FILL_H = BAR.h - INSET * 2;
const FILL_MAX = BAR.w - INSET * 2;

// the live dot at the bar's end, and the rings it sends out
const LIVE = { x: 141, y: BAR.y, r: 5.5 };
const RINGS = 2;
const RING_TO = 13;

const DURATION = 3.4;

/**
 * Deliver: "launched, and live". A progress bar draws on and fills, easing
 * in, pausing for a moment just short of the end, then finishing; on full
 * a dot pops on at its end and sends out two soft rings, like a live
 * signal. Up and running.
 */
export function DeliverArt({ active }: { active: boolean }) {
  const r = useRef<{
    bar: SVGPathElement | null;
    fill: SVGPathElement | null;
    dot: SVGCircleElement | null;
    rings: (SVGCircleElement | null)[];
  }>({ bar: null, fill: null, dot: null, rings: [] }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the bar draws on
    drawOn(r.bar, easeInOut(span(t, 0.05, 0.7)));

    // beat 2: it fills most of the way, pauses, then finishes
    const most = easeInOut(span(t, 0.8, 1.6)) * 0.82;
    const rest = easeInOut(span(t, 1.85, 2.2)) * 0.18;
    if (r.fill) {
      const w = FILL_MAX * (most + rest);
      r.fill.setAttribute('d', capsule(BAR.x + INSET + w / 2, BAR.y, w, FILL_H));
      r.fill.style.opacity = w > 0.1 ? '1' : '0';
    }

    // beat 3: the live dot pops on, and its rings spread out one after another
    r.dot?.setAttribute('r', String(LIVE.r * settle(span(t, 2.25, 2.55), 0.2)));
    r.rings.forEach((ring, i) => {
      if (!ring) return;
      const k = easeInOut(span(t, 2.45 + i * 0.35, 3.2 + i * 0.2));
      ring.setAttribute('r', String(lerp(LIVE.r, RING_TO, k)));
      ring.style.opacity = String(k > 0.01 && k < 1 ? (1 - k) * 0.85 : 0);
    });
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <path ref={(el) => { r.bar = el; }} d={capsule(BAR.x + BAR.w / 2, BAR.y, BAR.w, BAR.h)} fill='none' stroke={LINE} strokeWidth='4' strokeLinejoin='round' opacity='0' />
      <path ref={(el) => { r.fill = el; }} fill={LINE} d={capsule(BAR.x, BAR.y, 0.01, 0.01)} opacity='0' />
      {Array.from({ length: RINGS }, (_, i) => (
        <circle key={i} ref={(el) => { r.rings[i] = el; }} cx={LIVE.x} cy={LIVE.y} r={LIVE.r} fill='none' stroke={LINE} strokeWidth='1.8' opacity='0' />
      ))}
      <circle ref={(el) => { r.dot = el; }} cx={LIVE.x} cy={LIVE.y} r='0' fill={LINE} />
    </svg>
  );
}
