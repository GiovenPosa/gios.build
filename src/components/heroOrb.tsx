import { useEffect, useRef } from 'react';
import { createOrbShader, easeOut, runWhileVisible, ORB_RADIUS, ORB_SPEED } from '../lib/orb';
import './component-styles/heroOrb.css';

// The ring behind the hero headline: a soft, slightly wobbly soap-bubble rim
// whose colour gathers in three arcs (the site's red, a faint black, a touch
// of coral) that drift round it at different speeds, each at a slightly
// different radius, like light on a bubble. The look lives in lib/orb.ts.

// the canvas is this much bigger than the shader's unit, so the ring's soft
// edge and its wobble never touch the canvas's edge (see heroOrb.css)
const ROOM = 1.2;

// the entrance: how long the stroke takes to run round and settle, and how
// much faster than usual the colours turn at the start
const ENTRANCE_MS = 3000;
const ENTRANCE_SPIN = 3;

const RING = `
  uniform vec2 u_res; uniform float u_unit; uniform float u_size;
  // the entrance, 0 to 1: u_reveal eased fast-then-soft (the stroke's
  // travel), u_lin straight time (when things fade)
  uniform float u_reveal; uniform float u_lin;
  void main(){
    vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_unit;
    float r = length(p), a = atan(p.y, p.x), t = u_time;
    // the outline: a slow breath plus the ripples, so it's never quite a
    // circle. On entrance it's born smaller and swells out to size.
    float R = u_size * (1.0 + 0.015 * sin(t * 0.6)) * mix(0.82, 1.0, u_reveal) + ripple(a, t);
    // on entrance the rim starts thin and crisp and softens as it settles
    float w = rimWidth(a, t) * mix(0.4, 1.0, u_reveal);
    float d = r - R;

    // The entrance stroke: the red comet runs clockwise round the rim,
    // growing longer, and comes to rest exactly where the red arc lives, so
    // the stroke becomes it. Measured from its own nose (behind, wrapped to
    // -pi..pi), so there's no fixed start and no seam.
    float head = redAt(t) + (1.0 - u_reveal) * 1.25 * TAU;
    float behind = atan(sin(a - head), cos(a - head));
    float len = mix(0.25, 2.2, smoothstep(0.0, 0.7, u_lin));
    float stroke = comet(d, w, behind, len) * (1.0 - smoothstep(0.8, 1.0, u_lin));
    // the resting ring fades in under the stroke as it finishes its lap
    float ring = smoothstep(0.6, 1.0, u_lin);

    gl_FragColor = shade(arcs(d, w, a, t) * ring, stroke, band(d, w * 1.5) * 0.045 * ring);
  }`;

/**
 * `play` starts it, `delay` ms later. Its entrance is a red stroke: a short
 * comet that runs clockwise round the rim, growing a longer tail, fast then
 * softly stopping, and comes to rest as the ring's red arc while the rest of
 * the ring fades in beneath it. Meanwhile the ring swells from 82% to full
 * size and its edge softens from crisp to blurred. It pauses while off
 * screen or in a background tab, and visitors who turn motion off get the
 * finished ring as one still frame. Without WebGL it simply isn't drawn.
 */
export function HeroOrb({ play, delay = 0 }: { play: boolean; delay?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!play || !canvas) return;
    const shader = createOrbShader(canvas, RING);
    if (!shader) return;
    shader.set('u_size', ORB_RADIUS);

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let clock = 8; // a few seconds in, where the arcs are nicely spread
    // time spent on the entrance so far (only counts while it's drawing)
    let entered = still ? ENTRANCE_MS : 0;
    let started = false;

    const loop = runWhileVisible(canvas, (dt) => {
      if (!started) return false;
      entered = Math.min(entered + dt * 1000, ENTRANCE_MS);
      const reveal = easeOut(entered / ENTRANCE_MS);
      // the colours whip round as the ring is drawn, then slow to their drift
      clock += dt * ORB_SPEED * (1 + ENTRANCE_SPIN * Math.pow(1 - reveal, 2));
      const { width, height } = shader.fit();
      shader.set('u_res', width, height);
      shader.set('u_unit', width / ROOM);
      shader.set('u_time', clock);
      shader.set('u_reveal', reveal);
      shader.set('u_lin', entered / ENTRANCE_MS);
      shader.draw();
      return !still;
    });
    // start once the headline is part-way through building
    const start = window.setTimeout(() => {
      started = true;
      loop.wake();
    }, delay);

    return () => {
      window.clearTimeout(start);
      loop.stop();
      shader.dispose();
    };
  }, [play, delay]);

  return <canvas ref={canvasRef} className='hero-orb' aria-hidden />;
}
