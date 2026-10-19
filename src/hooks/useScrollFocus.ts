import { useEffect, type RefObject } from 'react';

// how much closer to the middle a new item must be before it takes over
const SWITCH_MARGIN = 24;

/**
 * Touch screens have no hover, so a list that opens its items on hover
 * opens them on scroll instead: the item whose centre is closest to the
 * middle of the screen becomes the active one. Focus only moves the way
 * you're scrolling (an item that grows as it opens shifts its neighbours,
 * and could otherwise flick focus back). Mouse devices are left alone, so
 * hover keeps working there. The scroll work only runs while the list is on
 * screen.
 *
 * `onFocus` gets the item's index among `selector` matches inside `root`;
 * pass a stable function (a state setter).
 */
export function useScrollFocus(
  root: RefObject<HTMLElement | null>,
  selector: string,
  onFocus: (index: number) => void
) {
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia('(hover: none)').matches) return;
    const items = [...el.querySelectorAll<HTMLElement>(selector)];
    let current = -1;
    let frameId = 0;
    let lastY = window.scrollY;

    const pick = () => {
      const y = window.scrollY;
      const down = y >= lastY;
      lastY = y;
      const middle = window.innerHeight / 2;
      const distance = (item: HTMLElement) => {
        const r = item.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - middle);
      };
      let best = -1;
      let bestDistance = Infinity;
      items.forEach((item, index) => {
        const d = distance(item);
        if (d < bestDistance) {
          best = index;
          bestDistance = d;
        }
      });
      if (best === -1 || best === current) return;
      // only forward while scrolling down, only back while scrolling up
      if (current !== -1 && (down ? best < current : best > current)) return;
      if (current !== -1 && distance(items[current]) - bestDistance < SWITCH_MARGIN) return;
      current = best;
      onFocus(best);
    };
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(pick);
    };

    // listen to scrolling only while the list is on screen
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
    visibility.observe(el);
    return () => {
      visibility.disconnect();
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
    };
  }, [root, selector, onFocus]);
}
