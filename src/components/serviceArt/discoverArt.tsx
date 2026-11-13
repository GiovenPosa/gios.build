import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Espresso line on warm sand ----
const INK = '#3b2a1f';
const SLOT = '#dfd5cb';

// the speech bubble, its tail at the bottom left
const BUBBLE = { x: 63, y: 18, w: 84, h: 52, r: 12 };
const bubblePath = () => {
  const { x, y, w, h, r } = BUBBLE;
  const mid = x + w / 2;
  // from top-centre, clockwise, so it draws on like being written
  return `M ${mid} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + 32} L ${x + 17} ${y + h + 12} L ${x + 19} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};
const MID_Y = BUBBLE.y + BUBBLE.h / 2;

// the three typing dots, and the homepage each one becomes: a headline, a
// line of text and a button, lined up on the same left edge
const DOT = 6.4;
const LEFT = BUBBLE.x + 18;
const DOTS = [
  { x: 95, to: { y: MID_Y - 11, w: 44, h: 6 }, alpha: 1 },
  { x: 105, to: { y: MID_Y, w: 30, h: 4 }, alpha: 0.5 },
  { x: 115, to: { y: MID_Y + 12, w: 20, h: 9 }, alpha: 1 },
];

// the little reply that approves it: a round badge with a tick, on the
// bubble's corner like a reaction (the card only shows x 50 to 160)
const REPLY = { x: 146, y: 70, r: 10 };
const TICK = `M ${REPLY.x - 4.6} ${REPLY.y + 0.4} L ${REPLY.x - 1.2} ${REPLY.y + 3.8} L ${REPLY.x + 5} ${REPLY.y - 3.4}`;

const DURATION = 3.4;

/**
 * Discover: "a conversation becomes your homepage". A speech bubble draws
 * itself on and three dots type inside it; then the dots stretch and slide
 * into a headline, a line of text and a button: the mockup. A small reply
 * pops onto its corner with a tick. Approved.
 */
export function DiscoverArt({ active }: { active: boolean }) {
  const r = useRef<{
    bubble: SVGPathElement | null;
    dots: (SVGPathElement | null)[];
    reply: SVGCircleElement | null;
    tick: SVGPathElement | null;
  }>({ bubble: null, dots: [], reply: null, tick: null }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the bubble draws itself on
    drawOn(r.bubble, easeInOut(span(t, 0.05, 0.75)));

    // beat 2: three dots pop in and type, each bouncing a beat after the last
    // beat 3: ...then each stretches into its line of the homepage
    r.dots.forEach((dot, i) => {
      if (!dot) return;
      const { x, to, alpha } = DOTS[i];
      const appear = settle(span(t, 0.6 + i * 0.08, 0.9 + i * 0.08), 0.15);
      const typing = span(t, 0.95, 1.75);
      const bounce = typing > 0 && typing < 1 ? Math.max(0, Math.sin((typing * 2 - i * 0.18) * Math.PI * 2)) * 3.2 : 0;
      const k = settle(span(t, 1.8 + i * 0.1, 2.4 + i * 0.1), 0.05);
      const w = lerp(DOT, to.w, k) * appear;
      const h = lerp(DOT, to.h, k) * appear;
      const cx = lerp(x, LEFT + to.w / 2, k);
      const cy = lerp(MID_Y - bounce, to.y, k);
      dot.setAttribute('d', capsule(cx, cy, w, h));
      dot.style.opacity = String(appear > 0.01 ? lerp(1, alpha, k) : 0);
    });

    // beat 4: the reply pops up, and its tick draws on
    const pop = settle(span(t, 2.55, 2.9), 0.14);
    r.reply?.setAttribute('r', String(REPLY.r * pop));
    drawOn(r.tick, easeInOut(span(t, 2.8, 3.15)));
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <path ref={(el) => { r.bubble = el; }} d={bubblePath()} fill='none' stroke={INK} strokeWidth='4' strokeLinejoin='round' strokeLinecap='round' opacity='0' />
      {DOTS.map((_, i) => (
        <path key={i} ref={(el) => { r.dots[i] = el; }} fill={INK} d={capsule(0, 0, 0.01, 0.01)} opacity='0' />
      ))}
      <circle ref={(el) => { r.reply = el; }} cx={REPLY.x} cy={REPLY.y} r='0' fill={INK} stroke={SLOT} strokeWidth='3' paintOrder='stroke' />
      <path ref={(el) => { r.tick = el; }} d={TICK} fill='none' stroke={SLOT} strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
