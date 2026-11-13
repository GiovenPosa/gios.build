import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/bookingContext';
import { CtaStickers } from './ctaStickers';
import './component-styles/closingCta.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WORDS = ["Let's", 'build', 'yours'];

/**
 * The home page's last word before the footer. The headline locks into place
 * as you scroll to it: its letters start spread wide and blurred and the
 * three words drift apart, then everything tightens into one poster line. The button underneath is magnetic: it leans
 * towards the cursor as you near it and springs back when you leave.
 *
 * Once the headline has locked in, the stickers round it (ctaStickers.tsx)
 * pop out of it to their places.
 *
 * Scroll progress is written to --p (0 to 1) on the section; the CSS does the
 * rest, so React never re-renders while you scroll (only once, as the
 * stickers start).
 */
export function ClosingCta() {
  const { openBooking } = useBooking();
  const sectionRef = useRef<HTMLElement | null>(null);
  const magnetRef = useRef<HTMLSpanElement | null>(null);
  // the stickers pop out once the headline has (nearly) locked in
  const [stickersOut, setStickersOut] = useState(false);

  // headline lock-in, driven by scroll
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (reducedMotion()) {
      section.style.setProperty('--p', '1');
      setStickersOut(true);
      return;
    }
    let frameId = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // from the section's top entering the screen to it reaching ~30% down
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh * 0.7)));
      section.style.setProperty('--p', p.toFixed(4));
      if (p > 0.85) setStickersOut(true);
    };
    const onScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // magnetic button: within reach it follows the cursor a little
  useEffect(() => {
    const magnet = magnetRef.current;
    if (!magnet || reducedMotion() || !window.matchMedia('(hover: hover)').matches) return;
    const REACH = 140; // px from the button's centre where the pull starts
    const PULL = 0.2; // share of the cursor's offset the button follows
    const MAX = 12; // px, so it never drifts into the button beside it
    let frameId = 0;
    let x = 0;
    let y = 0;
    let goalX = 0;
    let goalY = 0;

    const animate = () => {
      x += (goalX - x) * 0.18;
      y += (goalY - y) * 0.18;
      magnet.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      if (Math.abs(goalX - x) > 0.05 || Math.abs(goalY - y) > 0.05) frameId = requestAnimationFrame(animate);
    };
    const onMove = (event: PointerEvent) => {
      const box = magnet.getBoundingClientRect();
      const dx = event.clientX - (box.left + box.width / 2);
      const dy = event.clientY - (box.top + box.height / 2);
      const near = Math.hypot(dx, dy) < REACH + Math.max(box.width, box.height) / 2;
      goalX = near ? Math.max(-MAX, Math.min(MAX, dx * PULL)) : 0;
      goalY = near ? Math.max(-MAX, Math.min(MAX, dy * PULL)) : 0;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(animate);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  let letter = 0;
  return (
    <section className='cta' ref={sectionRef} aria-labelledby='cta-title'>
      <CtaStickers play={stickersOut} />

      <h2 className='cta-title' id='cta-title' aria-label="Let's build yours">
        {WORDS.map((word, w) => (
          <span key={word} className='cta-word' style={{ '--w': w - 1 } as CSSProperties} aria-hidden>
            {[...word].map((char) => (
              <span key={letter} className='cta-letter' style={{ '--i': letter++ } as CSSProperties}>
                {char}
              </span>
            ))}
          </span>
        ))}
      </h2>

      <p className='cta-sub'>
        Tell me about your business and I'll design your new homepage for free. Love it, and we build it.
      </p>

      <div className='cta-actions'>
        <span className='cta-magnet' ref={magnetRef}>
          <button type='button' className='hero-action-button hero-cta-pulse' onClick={() => openBooking('Closing CTA')}>
            <p>Get a free mockup</p>
            <GoArrowRight aria-hidden />
          </button>
        </span>
        <Link to='/packages' className='hero-action-button secondary'>
          <p>See packages</p>
        </Link>
      </div>
    </section>
  );
}
