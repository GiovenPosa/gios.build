import { useEffect, useRef, type CSSProperties } from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import { journeyData } from '../data/journey';
import { useBooking } from '../context/bookingContext';
import { Reveal } from './reveal';
import { SectionBar } from './sectionBar';
import { LoopVideo } from './loopVideo';
// square, card-sized cuts: the cards only ever show a small square
import IbmAnimate from '../assets/story/ibm-square.mp4';
import VanawaysAnimate from '../assets/story/vanaways-square.mp4';
import VanawaysAnimateWebm from '../assets/story/vanaways-square.webm';
import IbmPoster from '../assets/story/ibm-square.webp';
import VanawaysPoster from '../assets/story/vanaways-square.webp';
import BristolDome from '../assets/story/bristol-dome.webp';
import BristolLaptop from '../assets/story/bristol-laptop.webp';
import BristolLecture from '../assets/story/bristol-lecture.webp';
import GioPortrait from '../assets/story/gio-portrait.webp';

// chapters shown as one tilted card instead of the photo stack: a video of
// the work, or a single photo
const SINGLES: Record<string, { type: 'video' | 'image'; src: string; webm?: string; poster?: string }> = {
  IBM: { type: 'video', src: IbmAnimate, poster: IbmPoster },
  Vanaways: { type: 'video', src: VanawaysAnimate, webm: VanawaysAnimateWebm, poster: VanawaysPoster },
  'gios.build': { type: 'image', src: GioPortrait },
};

// real photos for a chapter's stack, back to front; chapters without any
// keep the placeholder tones
const PHOTOS: Record<string, { back: string; middle: string; front: string }> = {
  'University of Bristol': { back: BristolDome, middle: BristolLecture, front: BristolLaptop },
};
import './component-styles/storyStack.css';

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// placeholder tones for each chapter's image slot, from the work grid's
// palette, softened; swap for real photos later
const SLOTS = ['#dfd5cb', '#b8c4db', '#c9d6c8', '#1c1c1c'];

/**
 * "My story" as a deck of chapter cards. Each card sticks near the top of
 * the screen and the next one slides up over it, so the chapters pile into a
 * stack as you scroll. A card that's being covered eases back (scales down a
 * touch and dims), so the newest chapter always reads as the one on top. The
 * last card, the studio, is the dark one, with the photo slot and the call
 * to action.
 *
 * The stacking is plain position: sticky; JS only writes each card's --cover
 * (0 to 1, how much of it the next card has covered).
 */
export function StoryStack() {
  const { openBooking } = useBooking();
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || reducedMotion()) return;
    const cards = [...list.querySelectorAll<HTMLElement>('.story-card')];
    // touch screens have no hover, so the card that has most recently come
    // past the middle of the screen plays its hover state (photos fan out,
    // tilted cards straighten); on a mouse, hovering does it
    const touch = window.matchMedia('(hover: none)').matches;
    let current = -1;
    let frameId = 0;

    const update = () => {
      if (touch) {
        let next = -1;
        cards.forEach((card, index) => {
          if (card.getBoundingClientRect().top < window.innerHeight * 0.5) next = index;
        });
        if (next !== current) {
          cards[current]?.classList.remove('is-current');
          cards[next]?.classList.add('is-current');
          current = next;
        }
      }
      cards.forEach((card, index) => {
        const next = cards[index + 1];
        if (!next) return;
        const box = card.getBoundingClientRect();
        const below = next.getBoundingClientRect();
        // how far the next card has slid up over this one
        const cover = Math.min(1, Math.max(0, (box.bottom - below.top) / box.height));
        card.style.setProperty('--cover', cover.toFixed(4));
      });
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

  const last = journeyData.length - 1;

  return (
    // holds the testimonials' colour until the story ends
    <section className='story' id='story' data-backdrop-hold aria-labelledby='story-title'>
      <div className='story-intro'>
        <SectionBar label='My story' className='story-bar'>
          <span>{String(journeyData.length).padStart(2, '0')} milestones</span>
        </SectionBar>
        <Reveal as="h2" className='story-headline' delay={60} id='story-title'>
          <span>Engineer first.</span> <span>Designer always.</span>
        </Reveal>
        <Reveal as="p" className='story-subtext' delay={120}>
          I've always cared about two things: how software works, and how it feels to use.
        </Reveal>
      </div>

      <ol className='story-list' ref={listRef}>
        {journeyData.map((step, index) => (
          <li
            key={step.title}
            className={`story-card${index === last ? ' is-final' : ''}`}
            style={{ '--i': index } as CSSProperties}
          >
            <div className='story-copy'>
              <p className='story-chapter'>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </p>
              <h3 className='story-title'>{step.title}</h3>
              <p className='story-text'>{step.text}</p>
              {index === last && (
                <button type='button' className='hero-action-button story-cta' onClick={() => openBooking()}>
                  <p>Get a free mockup</p>
                  <GoArrowUpRight aria-hidden />
                </button>
              )}
            </div>
            <div className='story-slot' style={{ '--slot': SLOTS[index % SLOTS.length] } as CSSProperties} aria-hidden>
              {/* the first and last chapters set their place huge behind the photos,
                  cropped by the slot so only pieces of it show around them */}
              {(index === 0 || index === last) && <span className='story-word'>{step.stop}</span>}
              {SINGLES[step.stop] ? (
                // IBM, Vanaways and gios.build: one square card, tilted at
                // rest and settling straight on hover
                <div className='story-photos is-single'>
                  <span className='story-photo is-solo'>
                    {SINGLES[step.stop].type === 'video' ? (
                      <LoopVideo lazy src={SINGLES[step.stop].src} webm={SINGLES[step.stop].webm} poster={SINGLES[step.stop].poster} />
                    ) : (
                      <img src={SINGLES[step.stop].src} alt='' loading='lazy' decoding='async' draggable={false} />
                    )}
                  </span>
                </div>
              ) : (
                // three fanned photo placeholders; swap each for a real image later
                <div className='story-photos'>
                  {(['back', 'middle', 'front'] as const).map((layer) => {
                    const photo = PHOTOS[step.stop]?.[layer];
                    return (
                      <span key={layer} className={`story-photo is-${layer}${photo ? ' has-photo' : ''}`}>
                        {photo
                          ? <img src={photo} alt='' loading='lazy' decoding='async' draggable={false} />
                          : layer === 'front' && <em>{index === last ? 'Photo of Gio' : 'Photo'}</em>}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
