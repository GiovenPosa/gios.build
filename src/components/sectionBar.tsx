import type { ReactNode } from 'react';
import { Reveal } from './reveal';

interface SectionBarProps {
  label: string;
  /** Anything that sits at the right end of the rule: a count, a link. */
  children?: ReactNode;
  className?: string;
  /** Fade in on scroll. Off for bars inside pinned, scroll-driven sections. */
  reveal?: boolean;
  /** when given, the fade-in also waits for this */
  when?: boolean;
}

/**
 * The one eyebrow every section uses: a mono label, a hairline rule
 * running to the edge, and optionally something at its far end.
 */
export function SectionBar({ label, children, className = '', reveal = true, when }: SectionBarProps) {
  const content = (
    <>
      <span className='section-bar-label'>{label}</span>
      <span className='section-bar-rule' />
      {children}
    </>
  );
  const classes = `section-bar${className ? ` ${className}` : ''}`;
  return reveal
    ? <Reveal as="div" className={classes} when={when}>{content}</Reveal>
    : <div className={classes}>{content}</div>;
}
