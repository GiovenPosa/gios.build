import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Espresso line on fresh green ----
const INK = '#3b2a1f';
const SLOT = '#95fc9c';

// three sliders, each a track with a knob: where each knob starts, where
// the first round of changes takes it, and where the second settles it
// (kept inside x 50 to 160, the part of the drawing the card shows)
const TRACK = { x: 63, w: 60, h: 4 };
const KNOB = 6.5;
const SLIDERS = [
  { y: 30, at: [0.22, 0.68, 0.8] },
  { y: 50, at: [0.74, 0.38, 0.52] },
  { y: 70, at: [0.4, 0.86, 0.66] },
];
// the two rounds of changes; within each, every slider moves a beat after
// the one above it
const ROUNDS = [
  { from: 1.05, to: 1.6 },
  { from: 1.8, to: 2.35 },
];
const STAGGER = 0.08;

// the tick that signs it off, to the sliders' right
const DONE = { x: 143, y: 50, r: 11 };
const TICK = `M ${DONE.x - 4.8} ${DONE.y + 0.4} L ${DONE.x - 1.3} ${DONE.y + 3.9} L ${DONE.x + 5.2} ${DONE.y - 3.6}`;

const DURATION = 3.3;

/**
 * Refine: "we tune it together". Three sliders draw in and their knobs pop
 * on; then in two rounds, one after the other, the knobs are picked up
 * (swelling a touch) and moved, the fill following each; the second round
 * settles them, and a tick pops up beside them. Signed off.
 */
export function RefineArt({ active }: { active: boolean }) {
  const r = useRef<{
    tracks: (SVGPathElement | null)[];
    fills: (SVGPathElement | null)[];
    knobs: (SVGCircleElement | null)[];
    done: SVGCircleElement | null;
    tick: SVGPathElement | null;
  }>({ tracks: [], fills: [], knobs: [], done: null, tick: null }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    SLIDERS.forEach(({ y, at }, i) => {
      // beat 1: the track grows in from the left, then its knob pops on
      const grow = easeInOut(span(t, 0.05 + i * 0.1, 0.6 + i * 0.1));
      const track = r.tracks[i];
      if (track) {
        track.setAttribute('d', capsule(TRACK.x + (TRACK.w * grow) / 2, y, TRACK.w * grow, TRACK.h));
        track.style.opacity = grow > 0.01 ? '0.35' : '0';
      }
      const pop = settle(span(t, 0.5 + i * 0.1, 0.85 + i * 0.1), 0.16);

      // beats 2 and 3: two rounds of changes; a knob swells a touch while
      // it's held
      let place = at[0];
      let held = 0;
      ROUNDS.forEach(({ from, to }, round) => {
        const a = from + i * STAGGER;
        const b = to + i * STAGGER;
        place = lerp(place, at[round + 1], easeInOut(span(t, a, b)));
        held = Math.max(held, Math.sin(Math.PI * span(t, a - 0.08, b + 0.08)));
      });
      const x = TRACK.x + TRACK.w * place;

      const fill = r.fills[i];
      if (fill) {
        const w = (x - TRACK.x) * pop;
        fill.setAttribute('d', capsule(TRACK.x + w / 2, y, w, TRACK.h));
        fill.style.opacity = pop > 0.01 ? '1' : '0';
      }
      const knob = r.knobs[i];
      if (knob) {
        knob.setAttribute('cx', String(x));
        knob.setAttribute('r', String(KNOB * pop * (1 + held * 0.18)));
      }
    });

    // beat 4: a tick pops up to sign it off
    r.done?.setAttribute('r', String(DONE.r * settle(span(t, 2.55, 2.9), 0.14)));
    drawOn(r.tick, easeInOut(span(t, 2.8, 3.15)));
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      {SLIDERS.map(({ y }, i) => (
        <g key={i}>
          <path ref={(el) => { r.tracks[i] = el; }} fill={INK} d={capsule(TRACK.x, y, 0.01, 0.01)} opacity='0' />
          <path ref={(el) => { r.fills[i] = el; }} fill={INK} d={capsule(TRACK.x, y, 0.01, 0.01)} opacity='0' />
          <circle ref={(el) => { r.knobs[i] = el; }} cy={y} r='0' fill={INK} stroke={SLOT} strokeWidth='2.4' paintOrder='stroke' />
        </g>
      ))}
      <circle ref={(el) => { r.done = el; }} cx={DONE.x} cy={DONE.y} r='0' fill={INK} />
      <path ref={(el) => { r.tick = el; }} d={TICK} fill='none' stroke={SLOT} strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
