import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useInViewOnce } from '../hooks/useInViewOnce';

interface RevealProps {
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Stagger offset in ms, for items that sit side by side in the same row. */
  delay?: number;
  threshold?: number;
  /** when given, it also waits for this to be true before it reveals */
  when?: boolean;
  [key: string]: unknown;
}

/**
 * Fades + un-blurs a single item into place the moment it individually
 * scrolls into view. Each <Reveal> owns its own observer (useInViewOnce),
 * so items never wait on a shared/section-level trigger. No grouped or
 * blocked-together animation, even when several Reveals sit in one section.
 */
export function Reveal({
  as = 'div',
  className = '',
  style,
  children,
  delay = 0,
  threshold = 0.15,
  when = true,
  ...rest
}: RevealProps) {
  const { ref, isVisible } = useInViewOnce<HTMLElement>(threshold);
  const Component = as as ElementType;

  return (
    <Component
      ref={ref}
      className={`reveal${isVisible && when ? ' reveal-in' : ''}${className ? ` ${className}` : ''}`}
      style={{ ...style, '--reveal-delay': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Component>
  );
}
