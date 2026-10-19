import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * New page: back to the top. A link with a hash (/#story) scrolls to that
 * section instead, once it exists. Sections above it can still be settling
 * their height (the pinned ones measure themselves after mounting), so it
 * re-aims a couple of times.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    // the contact footer is fixed behind the page, revealed at the very end
    const aim = id === 'contact'
      ? () => window.scrollTo(0, document.documentElement.scrollHeight)
      : () => document.getElementById(id)?.scrollIntoView({ block: 'start' });
    const timers = [0, 150, 450].map((delay) => window.setTimeout(aim, delay));
    return () => timers.forEach(window.clearTimeout);
  }, [pathname, hash]);

  return null;
}
