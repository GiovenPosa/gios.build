import { useRef } from 'react';
import { capsule, drawOn, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. White line on soft baby blue ----
const INK = '#ffffff';
const SLOT = '#7cc4e4';

// the browser window the caret becomes
const WIN = { x: 61, y: 20, w: 88, h: 60, r: 10 };
const winPath = () => {
  const { x, y, w, h, r } = WIN;
  const mid = x + w / 2;
  // from top-centre, clockwise, so it unrolls from the bar above it
  return `M ${mid} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};
const TOOLBAR_Y = WIN.y + 12; // the line under the toolbar

// the caret, centred where the window's toolbar line will be
const CARET = { x: 105, y: 50, h: 24 };

// the button that builds inside
const BUTTON = { x: WIN.x + WIN.w / 2, y: (TOOLBAR_Y + WIN.y + WIN.h) / 2, w: 30, h: 11 };

// a pointer that comes in to press the button
const POINTER = 'M 0 0 L 0 14 L 3.6 10.6 L 6.2 16 L 8.6 14.9 L 6 9.6 L 11 9.6 Z';
const POINTER_FROM = { x: 168, y: 96 };
const POINTER_TO = { x: BUTTON.x + 4, y: BUTTON.y - 1 };

const DURATION = 3.6;

/**
 * New Websites: "from a blinking cursor to a site people use". A caret
 * blinks on the empty slot; it lies down and stretches into the toolbar
 * line as a browser window unrolls around it; a button pops in; then a
 * pointer drifts in and presses it. Live.
 */
export function NewSiteArt({ active }: { active: boolean }) {
  const r = useRef<{
    caret: SVGPathElement | null;
    win: SVGPathElement | null;
    dots: (SVGCircleElement | null)[];
    button: SVGPathElement | null;
    pointer: SVGPathElement | null;
  }>({ caret: null, win: null, dots: [], button: null, pointer: null }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the caret fades up and blinks once
    const caretIn = settle(span(t, 0.05, 0.35));
    const blink = t > 0.45 && t < 0.62 ? 0.15 : 1;
    // beat 2: it lies down into the toolbar line
    const lie = easeInOut(span(t, 0.75, 1.35));
    if (r.caret) {
      const w = lerp(4.5, WIN.w, lie);
      const h = lerp(CARET.h, 4, lie);
      const y = lerp(CARET.y, TOOLBAR_Y, lie);
      r.caret.setAttribute('d', capsule(CARET.x, y, w, h));
      r.caret.style.opacity = String(caretIn * (lie > 0 ? 1 : blink));
    }
    // ...and the window unrolls around it, with its three little dots
    drawOn(r.win, easeInOut(span(t, 1.05, 1.75)));
    r.dots.forEach((dot, i) => {
      if (!dot) return;
      dot.setAttribute('r', String(2.2 * settle(span(t, 1.55 + i * 0.07, 1.85 + i * 0.07))));
    });

    // beat 3: the button pops in, then dips as the pointer presses it
    const pop = settle(span(t, 2.25, 2.6), 0.12);
    const press = Math.sin(Math.PI * span(t, 3.05, 3.3)) * 0.12;
    if (r.button) {
      const k = pop * (1 - press);
      r.button.setAttribute('d', capsule(BUTTON.x, BUTTON.y, BUTTON.w * k, BUTTON.h * k));
      r.button.style.opacity = pop > 0.01 ? '1' : '0';
    }

    // the pointer drifts in from the corner and lands on the button
    const arrive = easeInOut(span(t, 2.45, 3.05));
    if (r.pointer) {
      const x = lerp(POINTER_FROM.x, POINTER_TO.x, arrive);
      const y = lerp(POINTER_FROM.y, POINTER_TO.y, arrive) - Math.sin(arrive * Math.PI) * 8;
      const s = 1 - press * 0.6;
      r.pointer.setAttribute('transform', `translate(${x} ${y}) scale(${s})`);
      r.pointer.style.opacity = arrive > 0.01 ? '1' : '0';
    }
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <path ref={(el) => { r.win = el; }} d={winPath()} fill='none' stroke={INK} strokeWidth='4' strokeLinejoin='round' strokeLinecap='round' opacity='0' />
      {[0, 1, 2].map((i) => (
        <circle key={i} ref={(el) => { r.dots[i] = el; }} cx={WIN.x + 10 + i * 6.5} cy={WIN.y + 6.5} r='0' fill={INK} />
      ))}
      <path ref={(el) => { r.caret = el; }} fill={INK} d={capsule(CARET.x, CARET.y, 4.5, CARET.h)} opacity='0' />
      <path ref={(el) => { r.button = el; }} fill={INK} d={capsule(BUTTON.x, BUTTON.y, 0.01, 0.01)} opacity='0' />
      <path ref={(el) => { r.pointer = el; }} d={POINTER} fill={INK} stroke={SLOT} strokeWidth='1.6' strokeLinejoin='round' paintOrder='stroke' opacity='0' />
    </svg>
  );
}
