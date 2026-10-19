import { useRef } from 'react';
import { drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box, rounded black line work ----
const INK = '#111';
const SLOT = '#e9e9eb'; // the slot's grey, used to cut the badge out of the page
const C = { x: 105, y: 50 };

// the client's site: a small rounded page with a header and a line of text
const PAGE = { w: 40, h: 52, r: 8 };
const PAGE_LEFT = C.x - PAGE.w / 2;
const PAGE_TOP = C.y - PAGE.h / 2;
const pagePath = () => {
  const { w, h, r } = PAGE;
  const x = PAGE_LEFT;
  const y = PAGE_TOP;
  // starts top-centre and draws on clockwise
  return `M ${C.x} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};
const LINES = [
  { x1: PAGE_LEFT + 9, x2: PAGE_LEFT + PAGE.w - 9, y: PAGE_TOP + 14 },
  { x1: PAGE_LEFT + 9, x2: PAGE_LEFT + PAGE.w - 17, y: PAGE_TOP + 23 },
];

// the ring of care around it, and where the watching dot finally lands
const RING_R = 41;
const CORNER = { x: PAGE_LEFT + PAGE.w - 1, y: PAGE_TOP + 1 }; // the page's top right
const CORNER_ANGLE = Math.atan2(CORNER.y - C.y, CORNER.x - C.x); // about -52°
const CORNER_DIST = Math.hypot(CORNER.x - C.x, CORNER.y - C.y);
// the ring starts and ends in line with the corner, so the lap finishes
// right where the dot steps in
const ringAt = (a: number) => ({ x: C.x + RING_R * Math.cos(a), y: C.y + RING_R * Math.sin(a) });
const RING_START = ringAt(CORNER_ANGLE);
const RING_HALF = ringAt(CORNER_ANGLE + Math.PI);
const ringPath = `M ${RING_START.x} ${RING_START.y} A ${RING_R} ${RING_R} 0 0 1 ${RING_HALF.x} ${RING_HALF.y} A ${RING_R} ${RING_R} 0 0 1 ${RING_START.x} ${RING_START.y}`;

// ---- timing: three calm beats ----
const DURATION = 3.2;

/**
 * Hosting & Care: "looked after". A small page draws itself in; a dot
 * draws a ring of care around it in one lap; then the dot steps in to the
 * page's corner and opens into a check badge as the ring lets go. Covered.
 *
 * Plays on the shared service-art timeline: loops while its line is active,
 * rewinds as the slot closes.
 */
export function HostingArt({ active }: { active: boolean }) {
  const refs = useRef<{
    page: SVGPathElement | null;
    lines: (SVGLineElement | null)[];
    ring: SVGPathElement | null;
    dot: SVGCircleElement | null;
    check: SVGPathElement | null;
  }>({ page: null, lines: [], ring: null, dot: null, check: null });
  const svg = useArtTimeline(active, DURATION, (t) => {
    const parts = refs.current;
    // beat 1: the page, then its two lines
    drawOn(parts.page, easeInOut(span(t, 0.05, 0.85)));
    parts.lines.forEach((line, i) => drawOn(line, easeInOut(span(t, 0.6 + i * 0.12, 0.95 + i * 0.12))));

    // beat 2: the dot draws the ring as it goes round, once; the ring
    // lets go as the dot steps in
    const lap = easeInOut(span(t, 1.0, 2.1));
    const ringIn = lap;
    const ringOut = easeInOut(span(t, 2.15, 2.6));
    drawOn(parts.ring, ringIn);
    if (parts.ring) parts.ring.style.opacity = String(ringIn > 0.001 ? 1 - ringOut : 0);

    // the dot: appears where the ring starts, rides its tip for one lap,
    // then steps in to the corner and opens into the badge
    if (parts.dot) {
      const appear = settle(span(t, 0.85, 1.2));
      const angle = CORNER_ANGLE + lap * Math.PI * 2;
      const inward = easeInOut(span(t, 2.1, 2.5));
      const dist = lerp(RING_R, CORNER_DIST, inward);
      const grow = settle(span(t, 2.3, 2.75));
      parts.dot.setAttribute('cx', String(C.x + dist * Math.cos(angle)));
      parts.dot.setAttribute('cy', String(C.y + dist * Math.sin(angle)));
      parts.dot.setAttribute('r', String(Math.max(0, lerp(4.2 * appear, 10, grow))));
    }

    // beat 3: the tick draws inside the badge
    drawOn(parts.check, easeInOut(span(t, 2.55, 3.05)));
  });

  const r = refs.current;
  const tick = `M ${CORNER.x - 4.2} ${CORNER.y + 0.3} L ${CORNER.x - 1.2} ${CORNER.y + 3.2} L ${CORNER.x + 4.4} ${CORNER.y - 3}`;
  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <path ref={(el) => { r.ring = el; }} d={ringPath} fill='none' stroke={INK} strokeWidth='2.6' strokeLinecap='round' opacity='0' />
      <path ref={(el) => { r.page = el; }} d={pagePath()} fill='none' stroke={INK} strokeWidth='4.5' strokeLinejoin='round' strokeLinecap='round' opacity='0' />
      {LINES.map((line, i) => (
        <line key={i} ref={(el) => { r.lines[i] = el; }} x1={line.x1} y1={line.y} x2={line.x2} y2={line.y} stroke={INK} strokeWidth='4.5' strokeLinecap='round' opacity='0' />
      ))}
      {/* the badge is cut out of the page by a ring in the slot's grey */}
      <circle ref={(el) => { r.dot = el; }} cx={RING_START.x} cy={RING_START.y} r='0' fill={INK} stroke={SLOT} strokeWidth='3.5' paintOrder='stroke' />
      <path ref={(el) => { r.check = el; }} d={tick} fill='none' stroke='#fff' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
