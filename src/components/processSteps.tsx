import { useEffect, useRef, useState } from 'react';
import { processData } from '../data/process';
import { Reveal } from './reveal';
import './component-styles/processSteps.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A connected 4-step process timeline. Steps alternate left/right down
 * the page around a straight center line (desktop) or a left-aligned
 * line (mobile). The line grows continuously as the user scrolls, with a
 * dot riding its tip, and each number solidifies from muted to dark the
 * moment the line reaches it.
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
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const fill = fillRef.current;
    const tip = tipRef.current;
    if (!container || !fill || !tip) return;
    const still = reducedMotion();
    const track = fill.parentElement as HTMLElement;
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
