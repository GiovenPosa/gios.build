import { useEffect, type RefObject } from 'react';

// a tap, click or key counts as permission to play in Safari, even in Low
// Power Mode; scrolling doesn't, but it's a cheap moment to try again
const NUDGES = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown', 'scroll'] as const;

/**
 * Keeps a muted, looping video playing while `active` (on screen, with its
 * source attached). A browser can turn down a play() that comes too early,
 * or stop a video to save power, and Safari then shows its own play button
 * over it. So rather than trust one call: try again every so often and on
 * the visitor's first tap, click, key or scroll, until it's moving, and
 * start trying again if it stops.
 */
export function useKeepPlaying(ref: RefObject<HTMLVideoElement | null>, active: boolean) {
  useEffect(() => {
    const video = ref.current;
    if (!video || !active) return;
    let retry = 0;
    const kick = () => {
      if (video.paused) video.play().catch(() => {});
    };
    const stop = () => {
      window.clearInterval(retry);
      NUDGES.forEach((e) => window.removeEventListener(e, kick));
    };
    const start = () => {
      stop();
      kick();
      retry = window.setInterval(kick, 800);
      NUDGES.forEach((e) => window.addEventListener(e, kick, { passive: true }));
    };
    start();
    video.addEventListener('playing', stop);
    video.addEventListener('pause', start);
    return () => {
      stop();
      video.removeEventListener('playing', stop);
      video.removeEventListener('pause', start);
    };
  }, [ref, active]);
}
