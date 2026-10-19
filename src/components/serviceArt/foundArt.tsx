import { useRef } from 'react';
import { capsule, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Light mint line on deep forest ----
const LINE = '#e7f1ec';
const STROKE = 4;

// the search results: three bars, the top one is "you"
const RESULTS = [
  { x: 62, y: 30, w: 64 },
  { x: 62, y: 50, w: 50 },
  { x: 62, y: 70, w: 58 },
];

// the magnifier: a lens and a handle, centred on its lens
const LENS_R = 9.5;
const HANDLE = 9;
// where it travels: in from the right, down the list, up to the top result
const PATH = [
  { x: 186, y: 78 },
  { x: 136, y: 70 },
  { x: 136, y: 50 },
  { x: 140, y: 26 },
];

// the pin the magnifier becomes, its head where the lens was
const pinPath = (cx: number, cy: number) => {
  const r = LENS_R;
  const tip = cy + r * 2.05;
  return `M ${cx} ${tip} C ${cx - 3} ${tip - 6} ${cx - r} ${cy + r * 0.75} ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} C ${cx + r} ${cy + r * 0.75} ${cx + 3} ${tip - 6} ${cx} ${tip} Z`;
};

const DURATION = 3.4;

/**
 * Getting Found: "searched for, then found". A short list of results draws
 * in; a magnifier glides in and scans down it, then rises to the top
 * result and rests there; its handle swings down and it becomes a map pin,
 * the top result brightening as a soft ripple spreads from the pin. Found.
 */
export function FoundArt({ active }: { active: boolean }) {
  const r = useRef<{
    results: (SVGPathElement | null)[];
    lens: SVGCircleElement | null;
    handle: SVGPathElement | null;
    pin: SVGPathElement | null;
    dot: SVGCircleElement | null;
    shadow: SVGEllipseElement | null;
    ripple: SVGEllipseElement | null;
  }>({ results: [], lens: null, handle: null, pin: null, dot: null, shadow: null, ripple: null }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the results draw in, faint, left to right
    const found = easeInOut(span(t, 2.45, 2.85));
    r.results.forEach((bar, i) => {
      if (!bar) return;
      const k = easeInOut(span(t, 0.05 + i * 0.12, 0.6 + i * 0.12));
      const { x, y, w } = RESULTS[i];
      bar.setAttribute('d', capsule(x + (w * k) / 2, y, w * k, 6));
      const base = 0.32;
      bar.style.opacity = k > 0.01 ? String(i === 0 ? lerp(base, 1, found) : lerp(base, 0.2, found)) : '0';
    });

    // beat 2: the magnifier glides in, scans down the list, rises to the top
    const legs = [easeInOut(span(t, 0.45, 1.15)), easeInOut(span(t, 1.25, 1.6)), easeInOut(span(t, 1.75, 2.25))];
    let x = PATH[0].x;
    let y = PATH[0].y;
    legs.forEach((k, i) => {
      x = lerp(x, PATH[i + 1].x, k);
      y = lerp(y, PATH[i + 1].y, k);
    });
    const shown = span(t, 0.45, 0.65);

    // beat 3: the handle swings down to point at the result, and the
    // magnifier becomes a pin
    const swing = easeInOut(span(t, 2.25, 2.65));
    const become = easeInOut(span(t, 2.45, 2.75));
    const angle = lerp(Math.PI / 4, Math.PI / 2, swing);
    if (r.lens) {
      r.lens.setAttribute('cx', String(x));
      r.lens.setAttribute('cy', String(y));
      r.lens.style.opacity = String(shown * (1 - become));
    }
    if (r.handle) {
      const from = LENS_R + STROKE / 2;
      const to = from + lerp(HANDLE, 6, swing);
      r.handle.setAttribute('d', `M ${x + from * Math.cos(angle)} ${y + from * Math.sin(angle)} L ${x + to * Math.cos(angle)} ${y + to * Math.sin(angle)}`);
      r.handle.style.opacity = String(shown * (1 - become));
    }
    if (r.pin) {
      r.pin.setAttribute('d', pinPath(x, y));
      r.pin.style.opacity = String(become);
    }
    if (r.dot) {
      r.dot.setAttribute('cx', String(x));
      r.dot.setAttribute('cy', String(y));
      r.dot.setAttribute('r', String(3.6 * settle(span(t, 2.65, 2.95), 0.2)));
    }

    // a resting shadow under the pin, and one ripple spreading out from it
    const groundY = y + LENS_R * 2.05 + 1.5;
    if (r.shadow) {
      const k = settle(span(t, 2.7, 3.0));
      r.shadow.setAttribute('cx', String(x));
      r.shadow.setAttribute('cy', String(groundY));
      r.shadow.setAttribute('rx', String(7 * k));
      r.shadow.setAttribute('ry', String(2.2 * k));
    }
    if (r.ripple) {
      const k = easeInOut(span(t, 2.75, DURATION));
      r.ripple.setAttribute('cx', String(x));
      r.ripple.setAttribute('cy', String(groundY));
      r.ripple.setAttribute('rx', String(lerp(7, 22, k)));
      r.ripple.setAttribute('ry', String(lerp(2.2, 6.5, k)));
      r.ripple.style.opacity = String(k > 0.01 ? (1 - k) * 0.8 : 0);
    }
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      {RESULTS.map((_, i) => (
        <path key={i} ref={(el) => { r.results[i] = el; }} fill={LINE} opacity='0' />
      ))}
      <ellipse ref={(el) => { r.ripple = el; }} fill='none' stroke={LINE} strokeWidth='1.8' rx='0' ry='0' opacity='0' />
      <ellipse ref={(el) => { r.shadow = el; }} fill={LINE} opacity='0.35' rx='0' ry='0' />
      <circle ref={(el) => { r.lens = el; }} r={LENS_R} fill='none' stroke={LINE} strokeWidth={STROKE} opacity='0' />
      <path ref={(el) => { r.handle = el; }} fill='none' stroke={LINE} strokeWidth={STROKE + 0.5} strokeLinecap='round' opacity='0' />
      <path ref={(el) => { r.pin = el; }} fill='none' stroke={LINE} strokeWidth={STROKE} strokeLinejoin='round' opacity='0' />
      <circle ref={(el) => { r.dot = el; }} r='0' fill={LINE} />
    </svg>
  );
}
