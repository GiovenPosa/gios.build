import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. White line on soft baby blue ----
const INK = '#ffffff';
const SLOT = '#7cc4e4';
const C = { x: 105, y: 50 };

// a page, drawn around the origin of a group so it can move as one
const PAGE = { w: 50, h: 64, r: 8 };
const pagePath = () => {
  const { w, h, r } = PAGE;
  const x = -w / 2;
  const y = -h / 2;
  return `M 0 ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

// the mockup's contents: a picture, a line of text, a button
const LEFT = -17;
const MOCKUP = [
  { y: -13, w: 34, h: 16, radius: 4, alpha: 1 },
  { y: 4, w: 26, h: 4, alpha: 0.5 },
  { y: 15, w: 16, h: 8, alpha: 1 },
];

// the pages designed around it, fanning out from behind it to either side
// (kept inside x 50 to 160, the part of the drawing the card shows). Each
// one's lines sit on its outer side, the part the mockup doesn't cover.
const SIDES = [
  { dx: -31, rot: -10, edge: -1 },
  { dx: 31, rot: 10, edge: 1 },
];
const SIDE_SCALE = 0.72;
const SIDE_LINES = [
  { y: -12, w: 26 },
  { y: -2, w: 18 },
];

const DURATION = 3.2;

/**
 * Design: "the rest of the site, designed around the mockup". The mockup
 * page draws on and its picture, text and button pop in; then two more
 * pages slide out from behind it, one to each side, tilting as they go,
 * and their own lines fill in. One look, carried across the site.
 */
export function DesignArt({ active }: { active: boolean }) {
  const r = useRef<{
    page: SVGPathElement | null;
    blocks: (SVGPathElement | null)[];
    sides: (SVGGElement | null)[];
    lines: (SVGPathElement | null)[];
  }>({ page: null, blocks: [], sides: [], lines: [] }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the mockup draws on, then its contents pop in one by one
    drawOn(r.page, easeInOut(span(t, 0.05, 0.7)));
    r.blocks.forEach((block, i) => {
      if (!block) return;
      const { y, w, h, radius, alpha } = MOCKUP[i];
      const k = settle(span(t, 0.5 + i * 0.12, 0.85 + i * 0.12), 0.14);
      block.setAttribute('d', capsule(LEFT + w / 2, y, w * k, h * k, radius));
      block.style.opacity = k > 0.01 ? String(alpha) : '0';
    });

    // beat 2: the other pages slide out from behind it, tilting as they go
    r.sides.forEach((side, i) => {
      if (!side) return;
      const { dx, rot } = SIDES[i];
      const k = settle(span(t, 1.25 + i * 0.1, 1.95 + i * 0.1), 0.06);
      const s = lerp(0.7, SIDE_SCALE, k);
      side.setAttribute('transform', `translate(${C.x + dx * k} ${C.y + 3 * k}) rotate(${rot * k}) scale(${s})`);
      side.style.opacity = String(span(t, 1.25 + i * 0.1, 1.5 + i * 0.1));
    });

    // beat 3: their lines fill in, the look carried across
    r.lines.forEach((line, n) => {
      if (!line) return;
      const i = n % SIDE_LINES.length;
      const page = Math.floor(n / SIDE_LINES.length);
      const { y, w } = SIDE_LINES[i];
      const { edge } = SIDES[page];
      const k = easeInOut(span(t, 2.15 + page * 0.12 + i * 0.1, 2.6 + page * 0.12 + i * 0.1));
      // grown in from the page's outer edge
      line.setAttribute('d', capsule(edge * (-LEFT - (w * k) / 2), y, w * k, 5));
      line.style.opacity = k > 0.01 ? (i === 0 ? '1' : '0.5') : '0';
    });
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      {/* the side pages first, so the mockup sits in front of them */}
      {SIDES.map((_, page) => (
        <g key={page} ref={(el) => { r.sides[page] = el; }} transform={`translate(${C.x} ${C.y}) scale(0.7)`} opacity='0'>
          <path d={pagePath()} fill={SLOT} stroke={INK} strokeWidth='4.6' strokeLinejoin='round' />
          {SIDE_LINES.map((_, i) => (
            <path key={i} ref={(el) => { r.lines[page * SIDE_LINES.length + i] = el; }} fill={INK} d={capsule(0, 0, 0.01, 0.01)} opacity='0' />
          ))}
        </g>
      ))}
      <g transform={`translate(${C.x} ${C.y})`}>
        {/* filled with the card's colour, so it hides the pages behind it */}
        <path d={pagePath()} fill={SLOT} stroke='none' />
        <path ref={(el) => { r.page = el; }} d={pagePath()} fill='none' stroke={INK} strokeWidth='4' strokeLinejoin='round' strokeLinecap='round' opacity='0' />
        {MOCKUP.map((_, i) => (
          <path key={i} ref={(el) => { r.blocks[i] = el; }} fill={INK} d={capsule(0, 0, 0.01, 0.01)} opacity='0' />
        ))}
      </g>
    </svg>
  );
}
