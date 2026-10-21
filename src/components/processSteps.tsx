import { useEffect, useRef, useState } from 'react';
import { processData } from '../data/process';
import { Reveal } from './reveal';
import { createOrbShader, runWhileVisible, orbUnit, ORB_RADIUS, ORB_SPEED } from '../lib/orb';
import './component-styles/processSteps.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The hero orb's rim laid straight down the line (lib/orb.ts has the look).
// y runs down from the line's start (the first number); a is the same
// distance as rim angle, so it ripples and colours exactly like the ring
// over the same length. The red comet's nose sits at the scroll position,
// and the drifting arcs fill in the way travelled behind it.
//
// The canvas runs PAD px past both ends of the line, so the stroke's soft
// nose and tail are never cut off by its edge; both ends fade in and out
// over a short stretch instead of stopping dead.
const PAD = 160;
const LINE = `
  uniform vec2 u_res; uniform float u_unit; uniform float u_radius;
  // the room above the line's start, and the line's length (units)
  uniform float u_pad; uniform float u_len;
  // how far down the line the nose is (units), and 0-1 to show it at all
  uniform float u_head; uniform float u_show;
  void main(){
    float x = (gl_FragCoord.x - 0.5 * u_res.x) / u_unit;
    float y = (u_res.y - gl_FragCoord.y) / u_unit - u_pad;
    float a = y / u_radius, t = u_time;
    float w = rimWidth(a, t);
    float d = x - ripple(a, t);
    // how far back from the nose, in rim angle; negative is still to come
    float behind = (u_head - y) / u_radius;
    // soft at both ends of the line: rises in from just above the first
    // number, settles out just past the last
    float ends = smoothstep(-0.06, 0.14, y) * (1.0 - smoothstep(u_len - 0.02, u_len + 0.12, y));
    float travelled = smoothstep(0.0, 0.2, behind) * ends * u_show;
    float stroke = comet(d, w, behind, 1.4) * ends * u_show;
    gl_FragColor = shade(arcs(d, w, a, t) * travelled, stroke, band(d, w * 1.5) * 0.045 * travelled);
  }`;

/**
 * A connected 4-step process timeline. Steps alternate left/right down
 * the page around a straight center line (desktop) or a left-aligned
 * line (mobile). As the user scrolls, the hero orb's red stroke runs down
 * the line (a WebGL canvas over it), its nose at the scroll position and
 * the orb's drifting colours filling in behind, and each number solidifies
 * from muted to dark the moment the nose reaches it. Without WebGL, a plain
 * black line grows instead, with a dot riding its tip.
 *
 * The line is driven from an animation loop, not React state: it scales on
 * the GPU (transform, not height) and eases toward the scroll position each
 * frame, so it glides instead of stepping. React only re-renders when a step
 * becomes active.
 */
export function ProcessSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const fill = fillRef.current;
    const tip = tipRef.current;
    const canvas = canvasRef.current;
    if (!container || !fill || !tip || !canvas) return;
    const still = reducedMotion();
    const track = fill.parentElement as HTMLElement;

    // the orb stroke; the black line and dot stay as the fallback
    const shader = createOrbShader(canvas, LINE);
    track.classList.toggle('has-orb', !!shader);
    let head = 0; // the nose's position along the line, 0-1
    let clock = 8;
    const orb = shader && runWhileVisible(canvas, (dt) => {
      clock += dt * ORB_SPEED;
      const { width, height, dpr } = shader.fit();
      const unit = orbUnit() * dpr;
      const pad = (PAD * dpr) / unit;
      const length = height / unit - pad * 2;
      shader.set('u_res', width, height);
      shader.set('u_unit', unit);
      shader.set('u_radius', ORB_RADIUS);
      shader.set('u_time', clock);
      shader.set('u_pad', pad);
      shader.set('u_len', length);
      shader.set('u_head', head * length);
      shader.set('u_show', Math.min(1, head * 40));
      shader.draw();
      // keep drifting while on screen; with motion off, redraw only on scroll
      return !still;
    });
    let marks: number[] = []; // where each number sits along the line, 0-1
    let shown = 0; // what's drawn
    let frameId = 0;
    let running = false;

    const target = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const startLine = viewportHeight * 0.85;
      const endLine = viewportHeight * 0.3;
      const total = rect.height + (startLine - endLine);
      const scrolled = startLine - rect.top;
      return Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));
    };

    const render = (progress: number) => {
      head = progress;
      orb?.wake();
      fill.style.transform = `scaleY(${progress})`;
      tip.style.transform = `translate(-50%, calc(${progress * 100}cqh - 50%))`;
      tip.style.opacity = progress > 0.002 && progress < 0.998 ? '1' : '0';
      // a step lights up the moment the tip reaches its number
      const count = marks.filter((mark) => progress > 0 && progress >= mark - 0.001).length;
      setActiveCount((previous) => (previous === count ? previous : count));
    };

    // ease toward the scroll position; stop once it has caught up
    const tick = () => {
      const goal = target();
      shown += (goal - shown) * 0.16;
      if (Math.abs(goal - shown) < 0.0005) shown = goal;
      render(shown);
      if (shown !== goal) frameId = requestAnimationFrame(tick);
      else running = false;
    };

    const onScroll = () => {
      if (still) {
        shown = target();
        render(shown);
        return;
      }
      if (!running) {
        running = true;
        frameId = requestAnimationFrame(tick);
      }
    };

    // Run the line from the first number's centre to the last one's, so it
    // never trails past step 4, then note where each number sits along it.
    const measure = () => {
      const numbers = [...container.querySelectorAll<HTMLElement>('.process-step-number')];
      if (numbers.length < 2) return;
      // layout offsets, not bounding boxes: the steps' fade-in transform
      // would otherwise shift every measurement
      const offsetWithin = (element: HTMLElement) => {
        let top = 0;
        let node: HTMLElement | null = element;
        while (node && node !== container) {
          top += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        return top;
      };
      const centres = numbers.map((number) => offsetWithin(number) + number.offsetHeight / 2);
      const height = container.offsetHeight;
      const first = centres[0];
      const last = centres[centres.length - 1];
      track.style.top = `${first}px`;
      track.style.bottom = `${height - last}px`;
      marks = centres.map((centre) => (last > first ? (centre - first) / (last - first) : 0));
      onScroll();
    };

    const onResize = () => measure();
    const resized = new ResizeObserver(onResize);
    resized.observe(container);
    document.fonts?.ready.then(onResize);
    shown = target();
    measure();
    render(shown);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frameId);
      orb?.stop();
      shader?.dispose();
      resized.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="process-steps" ref={containerRef}>
      <div className="process-steps-track">
        <div className="process-steps-track-fill" ref={fillRef} />
        <span className="process-steps-track-tip" ref={tipRef} aria-hidden />
        <canvas className="process-steps-orb" ref={canvasRef} aria-hidden />
      </div>

      <div className="process-steps-list">
        {processData.map((step, index) => {
          const isActive = index < activeCount;
          const side = index % 2 === 0 ? 'left' : 'right';

          return (
            <Reveal
              as="div"
              key={step.id}
              className={`process-step process-step-${side}${isActive ? ' process-step-active' : ''}`}
              delay={index * 60}
            >
              <span className="process-step-number">{step.id}</span>
              <div className="process-step-copy">
                <p className="process-step-title">{step.title}</p>
                <p className="process-step-text">{step.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
