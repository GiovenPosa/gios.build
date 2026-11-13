import { useEffect, useRef, type ButtonHTMLAttributes } from 'react';
import './uiKit.css';

// Page stand-ins for what the Gio UI library doesn't have yet: Chips, the
// Accordion and a secondary button. Everything else on the /ui page is the
// library's own code in components/ui/. Every colour, radius and font comes
// from the --ui-* tokens, so each can be swapped for the library's copy, once
// it ships, without any visual change.

const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

export interface Option {
  value: string;
  label: string;
}

/* ---------------- Secondary button ---------------- */

/** A quieter button. The primary one is the library's own (components/ui/button.tsx). */
export function SecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type='button' {...props} className={cx('gui-button', 'is-secondary', className)} />;
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' aria-hidden='true'>
      <path d='m5 12.5 4.5 4.5L19 7.5' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

/* ---------------- Chips ---------------- */

interface ChipsProps {
  name: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  labelledBy?: string;
  invalid?: boolean;
  describedBy?: string;
}

/** A quick single pick from a few options: pill buttons, as a radio group */
export function Chips({ name, value, options, onChange, labelledBy, invalid, describedBy }: ChipsProps) {
  return (
    <div className='gui-chips' role='radiogroup' aria-labelledby={labelledBy} aria-invalid={invalid || undefined} aria-describedby={describedBy}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label key={o.value} className={cx('gui-chip', on && 'is-on')}>
            <input type='radio' name={name} value={o.value} checked={on} onChange={() => onChange(o.value)} className='gui-chip-input' />
            {on && <Check className='gui-chip-check' />}
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/* ---------------- Accordion ---------------- */

const OPEN = { duration: 420, easing: 'cubic-bezier(0.2, 0.7, 0, 1)' };
const CLOSE = { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' };

/**
 * Native <details> rows whose open and close glide in every browser, one open
 * at a time. Without JS it's still the native accordion (no animation).
 */
export function Accordion({ name, items }: { name: string; items: { title: string; body: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const rows = [...list.querySelectorAll('details')];
    // the browser would snap the other row shut before its close could play
    rows.forEach((row) => row.removeAttribute('name'));
    const running = new Map<HTMLDetailsElement, Animation[]>();
    const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stop = (row: HTMLDetailsElement) => {
      running.get(row)?.forEach((animation) => animation.cancel());
      running.delete(row);
    };

    const toggle = (row: HTMLDetailsElement, open: boolean) => {
      const from = row.offsetHeight; // mid-animation too, so a re-click turns around smoothly
      stop(row);
      row.toggleAttribute('data-closing', !open);
      if (reduceMotion()) {
        row.open = open;
        row.removeAttribute('data-closing');
        return;
      }
      row.open = true; // stays open while closing, so the answer shows as it folds away
      const summary = row.querySelector('summary')!;
      const answer = summary.nextElementSibling as HTMLElement;
      const border = row.offsetHeight - row.clientHeight;
      const to = open ? row.offsetHeight : summary.offsetHeight + border;
      const timing = open ? OPEN : CLOSE;
      const height = row.animate({ height: [`${from}px`, `${to}px`], overflow: ['hidden', 'hidden'] }, timing);
      const content = answer.animate(
        open
          ? { opacity: [0, 1], transform: ['translateY(-0.5rem)', 'none'] }
          : { opacity: [1, 0], transform: ['none', 'translateY(-0.25rem)'] },
        open ? { ...timing, delay: 60, fill: 'backwards' } : { duration: 200, fill: 'forwards' }
      );
      running.set(row, [height, content]);
      height.onfinish = () => {
        if (!open) row.open = false;
        row.removeAttribute('data-closing');
        stop(row);
      };
    };

    const onClick = (event: MouseEvent) => {
      const summary = (event.target as HTMLElement).closest('summary');
      if (!summary || !list.contains(summary)) return;
      event.preventDefault();
      const row = summary.parentElement as HTMLDetailsElement;
      const opening = !row.open || row.hasAttribute('data-closing');
      if (opening) {
        rows.forEach((other) => {
          if (other !== row && other.open && !other.hasAttribute('data-closing')) toggle(other, false);
        });
      }
      toggle(row, opening);
    };

    list.addEventListener('click', onClick);
    return () => {
      list.removeEventListener('click', onClick);
      running.forEach((animations) => animations.forEach((animation) => animation.cancel()));
    };
  }, []);

  return (
    <div ref={ref} className='gui-accordion'>
      {items.map((item) => (
        <details key={item.title} name={name} className='gui-accordion-row'>
          <summary className='gui-accordion-summary'>
            {item.title}
            <svg className='gui-accordion-icon' viewBox='0 0 24 24' aria-hidden='true'>
              <path d='M12 5v14M5 12h14' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
            </svg>
          </summary>
          <p className='gui-accordion-body'>{item.body}</p>
        </details>
      ))}
    </div>
  );
}
