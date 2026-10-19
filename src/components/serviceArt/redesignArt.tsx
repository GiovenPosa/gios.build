import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Espresso line on fresh green ----
const INK = '#3b2a1f';
const C = { x: 105, y: 50 };

// the page, drawn around the origin of a group so it can be straightened
const CARD = { w: 64, h: 52, r: 9 };
const cardPath = () => {
  const { w, h, r } = CARD;
  const x = -w / 2;
  const y = -h / 2;
  return `M 0 ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};
const TILT = -9; // how crooked the old page sits, in degrees

// Its contents, before (crooked, uneven) and after (aligned: a headline, a
// line of text and a button). Each is the same shape, rearranged.
const BLOCKS = [
  { from: { left: -20, y: -13, w: 30, h: 5, rot: 7 }, to: { left: -22, y: -11, w: 40, h: 6, rot: 0 }, alpha: 1 },
  { from: { left: -15, y: 0, w: 22, h: 5, rot: -6 }, to: { left: -22, y: 0, w: 27, h: 4, rot: 0 }, alpha: 0.5 },
  { from: { left: -25, y: 11, w: 34, h: 5, rot: 4 }, to: { left: -22, y: 12, w: 18, h: 8, rot: 0 }, alpha: 1 },
];

// the sparkle that says "fresh", just off the page's top-right corner
const SPARKLE = { x: 140, y: 22 };
const STAR = 'M 0 -9 C 1 -2.2 2.2 -1 9 0 C 2.2 1 1 2.2 0 9 C -1 2.2 -2.2 1 -9 0 C -2.2 -1 -1 -2.2 0 -9 Z';
const GLINTS = [
  { x: 151, y: 34, r: 2 },
  { x: 129, y: 13, r: 1.6 },
];

const DURATION = 3.0;

/**
 * Redesigns: "messy to clear". An old page arrives crooked, its contents
 * uneven and askew, faintly restless; then in one calm move it straightens
 * and everything inside slides into line, becoming a headline, a line of
 * text and a button; a small sparkle opens at its corner. Fresh.
 */
export function RedesignArt({ active }: { active: boolean }) {
  const r = useRef<{
    card: SVGGElement | null;
    outline: SVGPathElement | null;
    blocks: (SVGPathElement | null)[];
    star: SVGPathElement | null;
    glints: (SVGCircleElement | null)[];
  }>({ card: null, outline: null, blocks: [], star: null, glints: [] }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the old page draws in, crooked; its blocks pop in askew
    drawOn(r.outline, easeInOut(span(t, 0.05, 0.75)));
    // beat 2: one calm move straightens the page...
    const tidy = settle(span(t, 1.15, 1.95), 0.05);
    r.card?.setAttribute('transform', `translate(${C.x} ${C.y}) rotate(${lerp(TILT, 0, tidy)})`);

    // ...and slides everything inside into line, one after another
    r.blocks.forEach((block, i) => {
      if (!block) return;
      const { from, to, alpha } = BLOCKS[i];
      const appear = settle(span(t, 0.45 + i * 0.1, 0.8 + i * 0.1), 0.15);
      // a faint restlessness while it's still messy
      const fidget = Math.sin(t * 7 + i * 2) * 1.2 * (1 - span(t, 1.1, 1.3));
      const k = settle(span(t, 1.25 + i * 0.09, 1.95 + i * 0.09), 0.05);
      const w = lerp(from.w, to.w, k) * appear;
      const h = lerp(from.h, to.h, k);
      const left = lerp(from.left, to.left, k);
      const y = lerp(from.y, to.y, k);
      const rot = lerp(from.rot + fidget, to.rot, k);
      block.setAttribute('d', capsule(0, 0, w, h));
      block.setAttribute('transform', `translate(${left + w / 2} ${y}) rotate(${rot})`);
      block.style.opacity = String(appear > 0.01 ? lerp(1, alpha, k) : 0);
    });

    // beat 3: the sparkle opens with a quarter turn, then its two glints
    const pop = settle(span(t, 2.05, 2.5), 0.12);
    r.star?.setAttribute('transform', `translate(${SPARKLE.x} ${SPARKLE.y}) rotate(${lerp(-45, 0, pop)}) scale(${pop})`);
    r.glints.forEach((glint, i) => {
      glint?.setAttribute('r', String(GLINTS[i].r * settle(span(t, 2.3 + i * 0.12, 2.65 + i * 0.12), 0.2)));
    });
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <g ref={(el) => { r.card = el; }} transform={`translate(${C.x} ${C.y}) rotate(${TILT})`}>
        <path ref={(el) => { r.outline = el; }} d={cardPath()} fill='none' stroke={INK} strokeWidth='4' strokeLinejoin='round' strokeLinecap='round' opacity='0' />
        {BLOCKS.map((_, i) => (
          <path key={i} ref={(el) => { r.blocks[i] = el; }} fill={INK} d={capsule(0, 0, 0.01, 0.01)} opacity='0' />
        ))}
      </g>
      <path ref={(el) => { r.star = el; }} d={STAR} fill={INK} transform={`translate(${SPARKLE.x} ${SPARKLE.y}) scale(0)`} />
      {GLINTS.map((glint, i) => (
        <circle key={i} ref={(el) => { r.glints[i] = el; }} cx={glint.x} cy={glint.y} r='0' fill={INK} />
      ))}
    </svg>
  );
}
