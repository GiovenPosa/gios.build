import { useRef } from 'react';
import { drawOn, easeInOut, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 150 box, deep forest line work on soft sage ----
const INK = '#1f3b2c';

// a month of visits: uneven, as real ones are, but heading up
const BASE = 118;
const POINTS = [
  { x: 40, y: 104 },
  { x: 66, y: 92 },
  { x: 90, y: 99 },
  { x: 116, y: 76 },
  { x: 140, y: 82 },
  { x: 168, y: 44 },
];
const LAST = POINTS[POINTS.length - 1];
const linePath = `M ${POINTS.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
const areaPath = `${linePath} L ${LAST.x} ${BASE} L ${POINTS[0].x} ${BASE} Z`;

const DURATION = 2.9;

/**
 * Business: "worth it". A baseline draws, then a line of visits climbs
 * across it, uneven but rising, its area shading in beneath; the newest
 * point pops and sends out a ping, like a visitor arriving live.
 */
export function BusinessArt({ active }: { active: boolean }) {
  const refs = useRef<{
    base: SVGLineElement | null;
    line: SVGPathElement | null;
    area: SVGPathElement | null;
    dot: SVGCircleElement | null;
    ping: SVGCircleElement | null;
  }>({ base: null, line: null, area: null, dot: null, ping: null });

  const svg = useArtTimeline(active, DURATION, (t) => {
    const parts = refs.current;
    // beat 1: the baseline
    drawOn(parts.base, easeInOut(span(t, 0.05, 0.5)));

    // beat 2: the line climbs, and the area under it shades in
    drawOn(parts.line, easeInOut(span(t, 0.35, 1.6)));
    if (parts.area) parts.area.style.opacity = String(0.16 * easeInOut(span(t, 1.1, 1.8)));

    // beat 3: the newest point pops and pings
    parts.dot?.setAttribute('r', String(7 * settle(span(t, 1.5, 1.85))));
    if (parts.ping) {
      const ping = span(t, 1.85, 2.6);
      parts.ping.setAttribute('r', String(7 + 16 * easeInOut(ping)));
      parts.ping.style.opacity = String(ping > 0 ? 1 - ping : 0);
    }
  });

  const r = refs.current;
  return (
    <svg className='lens-art' ref={svg} viewBox='0 0 210 150' aria-hidden>
      <path ref={(el) => { r.area = el; }} d={areaPath} fill={INK} opacity='0' />
      <line ref={(el) => { r.base = el; }} x1={POINTS[0].x - 6} y1={BASE} x2={LAST.x + 6} y2={BASE} stroke={INK} strokeWidth='3' strokeLinecap='round' opacity='0' />
      <path ref={(el) => { r.line = el; }} d={linePath} fill='none' stroke={INK} strokeWidth='4.5' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
      <circle ref={(el) => { r.ping = el; }} cx={LAST.x} cy={LAST.y} r='7' fill='none' stroke={INK} strokeWidth='2.2' opacity='0' />
      <circle ref={(el) => { r.dot = el; }} cx={LAST.x} cy={LAST.y} r='0' fill={INK} />
    </svg>
  );
}
