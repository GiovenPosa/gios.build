import { useEffect, useLayoutEffect, useRef } from 'react';

// Shared by the service-line graphics: the timeline they play on and the
// small shape helpers they draw with.

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** 0 to 1 across [a, b] of the timeline. */
export const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
/** The site's fast-then-soft curve, with the faintest settle past the end. */
export const settle = (k: number, overshoot = 0.06) => {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  return 1 - Math.pow(1 - k, 3) + Math.sin(k * Math.PI) * overshoot;
};

/** A rounded rectangle centred on (cx, cy): a dot when w = h, a bar when long. */
export const capsule = (cx: number, cy: number, w: number, h: number, radius?: number) => {
  const width = Math.max(0.01, w);
  const height = Math.max(0.01, h);
  const r = Math.min(radius ?? Math.min(width, height) / 2, width / 2, height / 2);
  const x = cx - width / 2;
  const y = cy - height / 2;
  return `M ${x + r} ${y} H ${x + width - r} A ${r} ${r} 0 0 1 ${x + width} ${y + r} V ${y + height - r} A ${r} ${r} 0 0 1 ${x + width - r} ${y + height} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + height - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

/** Reveal a stroke from its start: k = 0 hidden, 1 fully drawn. */
export const drawOn = (el: SVGGeometryElement | null, k: number) => {
  if (!el) return;
  const length = Number(el.dataset.length) || (el.dataset.length = String(el.getTotalLength()), Number(el.dataset.length));
  el.style.strokeDasharray = `${length}`;
  el.style.strokeDashoffset = `${length * (1 - k)}`;
  el.style.opacity = k > 0.001 ? '1' : '0';
};

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// the loop: after a graphic finishes it holds, fades away, rests, replays
const HOLD = 1.8;
const FADE = 0.45;
const REST = 0.35;

/**
 * Plays a graphic's timeline. While its line is active it plays forward,
 * holds the finished frame, fades softly away and starts again, on a loop.
 * When the line stops being active it rewinds quickly as the slot closes.
 * With reduced motion there is no loop: it shows the finished frame.
 *
 * Returns a ref for the graphic's <svg>, which the loop fades.
 */
export function useArtTimeline(active: boolean, duration: number, render: (t: number) => void) {
  const time = useRef(0);
  const svg = useRef<SVGSVGElement | null>(null);
  const draw = useRef(render);
  // keep the latest render function without restarting the timeline
  useLayoutEffect(() => {
    draw.current = render;
  });

  useEffect(() => {
    const setOpacity = (value: number) => {
      if (svg.current) svg.current.style.opacity = String(value);
    };
    if (reducedMotion()) {
      time.current = active ? duration : 0;
      setOpacity(1);
      draw.current(time.current);
      return;
    }
    let frameId = 0;
    let last = 0;
    // how long the finished frame has been showing, for the loop
    let after = 0;
    const step = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (active) {
        if (time.current < duration) {
          time.current = Math.min(duration, time.current + dt);
          setOpacity(1);
        } else {
          after += dt;
          if (after < HOLD) setOpacity(1);
          else if (after < HOLD + FADE) setOpacity(1 - easeInOut((after - HOLD) / FADE));
          else if (after < HOLD + FADE + REST) setOpacity(0);
          else {
            // start again from a blank slot
            after = 0;
            time.current = 0;
            setOpacity(1);
          }
        }
        draw.current(time.current);
        frameId = requestAnimationFrame(step);
        return;
      }
      // closing: rewind quickly from wherever it is, fully visible
      after = 0;
      setOpacity(1);
      time.current = clamp(time.current - dt * 2.6, 0, duration);
      draw.current(time.current);
      if (time.current > 0) frameId = requestAnimationFrame(step);
    };
    draw.current(time.current);
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [active, duration]);

  return svg;
}
