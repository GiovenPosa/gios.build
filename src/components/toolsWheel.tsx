import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { appMark, type ToolItem } from '../data/tools';
import { ToolIcon } from './toolIcon';
import './component-styles/toolsWheel.css';

// one notch every two seconds
const TICK_MS = 2000;

// Where a tile sits for each step out from the front of the wheel, in tile
// widths: `along` the wheel's travel, `across` towards the middle of the
// page (the front tile sits furthest out, the ones behind tuck in), its
// scale, blur and opacity. From three steps out it's round the back, out of
// sight, which is where a tile wraps from one end to the other.
const SLOTS = [
  { along: 0, across: 0, scale: 1, blur: 0, opacity: 1 },
  { along: 0.66, across: 0.34, scale: 0.84, blur: 0, opacity: 1 },
  { along: 1.16, across: 0.78, scale: 0.7, blur: 3, opacity: 0.85 },
  { along: 1.45, across: 1.05, scale: 0.52, blur: 8, opacity: 0 },
];

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A column of tool tiles turning like a wheel seen side on: the front tile
 * biggest and sharpest, the ones behind it smaller, tucked in and, at the
 * back, blurred. Every two seconds it turns one notch, `down` or `up`. It
 * only turns while on screen, and stays still for visitors who turn motion
 * off. Decorative: the section lists the tools for screen readers.
 */
export function ToolsWheel({ tools, turn, side }: { tools: ToolItem[]; turn: 'down' | 'up'; side: 'left' | 'right' }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    let timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setStep((s) => s + 1), TICK_MS);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const count = tools.length;
  const middle = Math.floor(count / 2);
  const direction = turn === 'down' ? 1 : -1;

  return (
    <div className={`tools-wheel is-${side}`} ref={ref} aria-hidden>
      {tools.map((tool, i) => {
        // this tile's place on the wheel, counted out from the front
        const k = ((((i + direction * step) % count) + count) % count) - middle;
        const slot = SLOTS[Math.min(Math.abs(k), SLOTS.length - 1)];
        const style = {
          '--along': slot.along * Math.sign(k),
          '--across': slot.across,
          '--scale': slot.scale,
          '--blur': `${slot.blur}px`,
          '--opacity': slot.opacity,
          zIndex: SLOTS.length - Math.abs(k),
          '--app-bg': tool.app.tile,
        } as CSSProperties;
        return (
          <span key={tool.name} className='tools-wheel-tile' style={style}>
            <ToolIcon tool={appMark(tool)} />
          </span>
        );
      })}
    </div>
  );
}
