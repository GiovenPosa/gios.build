import { useRef } from 'react';
import { drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 150 box, white line work on baby blue ----
const INK = '#ffffff';
const SLOT = '#7cc4e4'; // the slot's blue, used to cut the badge out
// the dial sits left of centre so the dial and its badge together are centred
const C = { x: 93.5, y: 97 };
const R = 54;
// the dial, left to right over the top
const arcPath = `M ${C.x - R} ${C.y} A ${R} ${R} 0 0 1 ${C.x + R} ${C.y}`;
const NEEDLE = 40;
// where the needle lands: most of the way round, a high score
const FROM = Math.PI; // pointing left
const TO = Math.PI * 1.86;
const BADGE = { x: C.x + R * Math.cos(TO) + 14, y: C.y + R * Math.sin(TO) - 12 };

const DURATION = 2.9;

/**
 * Technical: "built right". A dial draws itself in, its needle swings up
 * to a high score and settles with the site's soft overshoot, then a check
 * badge opens beside it. Speed, accessibility, forms: passed.
 */
export function TechnicalArt({ active }: { active: boolean }) {
  const refs = useRef<{
    arc: SVGPathElement | null;
    needle: SVGLineElement | null;
    hub: SVGCircleElement | null;
    badge: SVGCircleElement | null;
    check: SVGPathElement | null;
  }>({ arc: null, needle: null, hub: null, badge: null, check: null });

  const svg = useArtTimeline(active, DURATION, (t) => {
    const parts = refs.current;
    // beat 1: the dial
    drawOn(parts.arc, easeInOut(span(t, 0.05, 0.8)));

    // beat 2: the hub, then the needle swings up and settles
    const hub = settle(span(t, 0.55, 0.85));
    parts.hub?.setAttribute('r', String(7 * hub));
    if (parts.needle) {
      const show = span(t, 0.6, 0.75);
      const swing = settle(span(t, 0.75, 1.75), 0.09);
      const angle = lerp(FROM, TO, swing);
      parts.needle.setAttribute('x2', String(C.x + NEEDLE * Math.cos(angle)));
      parts.needle.setAttribute('y2', String(C.y + NEEDLE * Math.sin(angle)));
      parts.needle.style.opacity = String(show);
    }

    // beat 3: the badge opens and its tick draws
    parts.badge?.setAttribute('r', String(Math.max(0, 13 * settle(span(t, 1.75, 2.15)))));
    drawOn(parts.check, easeInOut(span(t, 2.05, 2.5)));
  });

  const r = refs.current;
  const tick = `M ${BADGE.x - 5.4} ${BADGE.y + 0.4} L ${BADGE.x - 1.6} ${BADGE.y + 4.2} L ${BADGE.x + 5.6} ${BADGE.y - 3.8}`;
  return (
    <svg className='lens-art' ref={svg} viewBox='0 0 210 150' aria-hidden>
      <path ref={(el) => { r.arc = el; }} d={arcPath} fill='none' stroke={INK} strokeWidth='4.5' strokeLinecap='round' opacity='0' />
      <line ref={(el) => { r.needle = el; }} x1={C.x} y1={C.y} x2={C.x - NEEDLE} y2={C.y} stroke={INK} strokeWidth='4.5' strokeLinecap='round' opacity='0' />
      <circle ref={(el) => { r.hub = el; }} cx={C.x} cy={C.y} r='0' fill={INK} />
      <circle ref={(el) => { r.badge = el; }} cx={BADGE.x} cy={BADGE.y} r='0' fill={INK} stroke={SLOT} strokeWidth='3.5' paintOrder='stroke' />
      <path ref={(el) => { r.check = el; }} d={tick} fill='none' stroke={SLOT} strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
