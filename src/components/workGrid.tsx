import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useColumnCount } from '../hooks/useColumnCount';
import { useKeepPlaying } from '../hooks/useKeepPlaying';
import type { WorkItem, WorkMedia } from '../data/work';
import { Reveal } from './reveal';
import { track } from '../lib/analytics';
import { LoopVideo, WEBM_TYPE } from './loopVideo';
import './component-styles/workGrid.css';

// Two columns: each card goes in whichever column is shorter so far, so the
// columns end level instead of one running long (dealing them alternately
// stacked the tall cards on one side).
function balanceColumns<T extends { ratio: string }>(cards: T[], count: number): T[][] {
  const columns: T[][] = Array.from({ length: count }, () => []);
  const heights = Array(count).fill(0);
  for (const card of cards) {
    const [w, h] = card.ratio.split('/').map(Number);
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(card);
    heights[shortest] += h / w;
  }
  return columns;
}

// how long a top-row card waits for its reel to start before it shows its
// still instead
const FIRST_ROW_PATIENCE = 1200;

interface CardMediaProps {
  media: WorkMedia;
  /** on screen at load: starts loading with the page */
  eager?: boolean;
  /** may start loading once it's near the screen (the top row goes first) */
  canLoad?: boolean;
  /** the reel is moving (or the image is in) */
  onReady?: () => void;
}

/**
 * A card's media. Its still (the reel's first frame, as the video's own
 * poster) holds the place while the reel loads, and the reel carries on from
 * that same frame, so there's no jump. Top-row cards (`eager`) load with the
 * page; the rest wait for them, then load once they're near the screen. Reels
 * only play while on screen, so a page of them stays light.
 */
function CardMedia({ media, eager = false, canLoad = true, onReady }: CardMediaProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // near the screen, so worth loading
  const [near, setNear] = useState(false);
  // on the screen: it plays
  const [visible, setVisible] = useState(false);
  // with a still to show there's nothing to hide; without one, the video
  // fades in once it has a frame, so a loading card never flashes black
  const [ready, setReady] = useState(!!media.poster);
  const visibleRef = useRef(false);
  // the sources are attached (and stay, once loaded)
  const load = eager || (near && canLoad);

  useEffect(() => {
    const video = ref.current;
    if (!video || media.type !== 'video') return;
    // React sets `muted` only as a property and never writes the attribute,
    // and Safari decides whether a video may play by itself from the
    // attribute; so write it before any source is attached
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setNear(true);
    }, { rootMargin: '400px 0px' });
    const onScreen = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      setVisible(entry.isIntersecting);
    });
    nearby.observe(video);
    onScreen.observe(video);
    return () => {
      nearby.disconnect();
      onScreen.disconnect();
    };
  }, [media]);

  // once the sources are attached, have the video pick one and start loading
  useEffect(() => {
    if (load) ref.current?.load();
  }, [load]);

  // on screen, keep it playing (see useKeepPlaying); off screen, pause it
  useKeepPlaying(ref, load && visible);
  useEffect(() => {
    if (load && !visible) ref.current?.pause();
  }, [load, visible]);

  const style = { objectPosition: media.focus } as CSSProperties;
  if (media.type === 'image') {
    return (
      <img
        className='work-media is-ready'
        src={media.src}
        alt=''
        loading={eager ? 'eager' : 'lazy'}
        decoding='async'
        draggable={false}
        onLoad={() => onReady?.()}
        ref={(img) => {
          // already in from the cache
          if (img?.complete) onReady?.();
        }}
        style={style}
      />
    );
  }
  return (
    <video
      ref={ref}
      className={`work-media${ready ? ' is-ready' : ''}`}
      poster={media.poster}
      muted
      loop
      playsInline
      // nothing loads until it's needed; then all of it
      preload={load ? 'auto' : 'none'}
      disablePictureInPicture
      disableRemotePlayback
      // without a still: show it as soon as there's a frame, not only once it
      // plays, so with autoplay blocked the card still shows its first frame
      onLoadedData={() => setReady(true)}
      onPlaying={() => {
        setReady(true);
        onReady?.();
      }}
      // and try again the moment it can play
      onCanPlay={(e) => {
        if (visibleRef.current) e.currentTarget.play().catch(() => {});
      }}
      style={style}
    >
      {load && media.webm && <source src={media.webm} type={WEBM_TYPE} />}
      {load && <source src={media.src} type='video/mp4' />}
    </video>
  );
}

interface Opened {
  item: WorkItem;
  /** where the card sat on screen, so the view can grow out of it */
  from: DOMRect;
}

/**
 * The larger view: the project's full, uncropped media over a dark scrim.
 * It grows out of the card that opened it and shrinks back into it.
 */
function WorkViewer({ opened, onClose }: { opened: Opened; onClose: () => void }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const { item, from } = opened;
  const media = item.full ?? item.media;

  // from the card's place and size to the middle of the screen, scaled
  // evenly so nothing stretches on the way
  const fromCard = () => {
    const frame = frameRef.current!.getBoundingClientRect();
    const dx = from.left + from.width / 2 - (frame.left + frame.width / 2);
    const dy = from.top + from.height / 2 - (frame.top + frame.height / 2);
    const scale = Math.min(from.width / frame.width, from.height / frame.height);
    return `translate(${dx}px, ${dy}px) scale(${scale})`;
  };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    if (reduced || !frameRef.current) return onClose();
    const ease = 'cubic-bezier(0.5, 0, 0.75, 0)';
    frameRef.current.animate(
      [{ transform: 'none', opacity: 1 }, { transform: fromCard(), opacity: 0 }],
      { duration: 320, easing: ease, fill: 'forwards' }
    );
    scrimRef.current?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, easing: 'ease', fill: 'forwards' })
      .finished.then(onClose);
  };

  useEffect(() => {
    if (!reduced && frameRef.current) {
      // fast off the mark, then a soft stop
      const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
      frameRef.current.animate(
        [{ transform: fromCard(), opacity: 0.4 }, { transform: 'none', opacity: 1 }],
        { duration: 560, easing: ease }
      );
      scrimRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, easing: 'ease' });
    }
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
    // runs once per opening; the helpers only read refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className='work-viewer' role='dialog' aria-modal='true' aria-label={item.title} onClick={close}>
      <div className='work-viewer-scrim' ref={scrimRef} />
      <div className='work-viewer-frame' ref={frameRef} style={{ '--aspect': item.aspect } as CSSProperties}>
        <div className='work-viewer-media'>
          {media.type === 'video' ? (
            <LoopVideo src={media.src} />
          ) : (
            <img src={media.src} alt={item.title} draggable={false} />
          )}
        </div>
        <div className='work-viewer-caption'>
          <span>{item.title}</span>
          <span className='work-viewer-meta'>{item.meta}</span>
        </div>
      </div>
      <button className='work-viewer-close' ref={closeRef} type='button' aria-label='Close' onClick={close}>
        <i /><i />
      </button>
    </div>,
    document.body
  );
}

/**
 * The work catalog: staggered columns of project reels with a mono caption
 * under each. Clicking a card opens its reel larger. Shared by the home page
 * and the Work page so the two never drift apart.
 */
export function WorkGrid({ items, hold = false, onFirstRowIn }: {
  items: WorkItem[];
  /** keep the top row back (the home page holds it until the hero has built) */
  hold?: boolean;
  /** the top row has started to come in, so anything that belongs with it
   *  (the section's eyebrow) can come in too */
  onFirstRowIn?: () => void;
}) {
  // Real flex columns rather than CSS `columns`: Chrome drops the paint of
  // transformed items inside multi-column layout, so hovered cards vanished.
  const columnCount = useColumnCount();
  const columns = columnCount === 2
    ? balanceColumns(items, 2)
    : Array.from({ length: columnCount }, (_, column) => items.filter((_, index) => index % columnCount === column));
  const [opened, setOpened] = useState<Opened | null>(null);

  // The top row fades in only once its reels are moving, so it never sits
  // there as stills. Each card goes when its own reel starts; any still
  // waiting after FIRST_ROW_PATIENCE goes anyway, showing its still.
  const [moving, setMoving] = useState<ReadonlySet<string>>(() => new Set());
  const [patienceUp, setPatienceUp] = useState(false);
  const markMoving = (title: string) =>
    setMoving((prev) => (prev.has(title) ? prev : new Set(prev).add(title)));
  useEffect(() => {
    if (hold) return;
    const timer = window.setTimeout(() => setPatienceUp(true), FIRST_ROW_PATIENCE);
    return () => window.clearTimeout(timer);
  }, [hold]);
  const firstRow = columns.map((column) => column[0]?.title).filter(Boolean);
  // the rest of the reels load once the top row is moving (or has had its
  // chance), so they don't take its bandwidth
  const firstRowDone = patienceUp || firstRow.every((title) => moving.has(title));
  const firstRowIn = !hold && (patienceUp || firstRow.some((title) => moving.has(title)));
  useEffect(() => {
    if (firstRowIn) onFirstRowIn?.();
  }, [firstRowIn, onFirstRowIn]);

  const open = (item: WorkItem, card: HTMLElement) => {
    const surface = card.querySelector('.work-surface') ?? card;
    track('Open project', { project: item.title });
    setOpened({ item, from: surface.getBoundingClientRect() });
  };

  return (
    <>
      <div className='work-grid'>
        {columns.map((column, columnIndex) => (
          <div className='work-column' key={columnIndex}>
            {column.map((item, row) => (
              <Reveal
                as="div"
                key={item.title}
                className={`work-card${item.dark ? ' is-dark' : ''}`}
                delay={columnIndex * 80}
                // the top row comes in together, however little of a tall
                // card is showing yet
                threshold={row === 0 ? 0 : undefined}
                // the top row as its reels start; the rest never ahead of it
                when={!hold && (row === 0 ? patienceUp || moving.has(item.title) : firstRowDone)}
                role='button'
                tabIndex={0}
                onClick={(e: MouseEvent<HTMLElement>) => open(item, e.currentTarget)}
                onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open(item, e.currentTarget);
                  }
                }}
              >
                {/* the surface is its own element so the hover scale never
                    fights the Reveal's entrance transform */}
                <div className='work-surface' style={{ aspectRatio: item.ratio }}>
                  {/* the top card of each column is on screen at load */}
                  <CardMedia
                    media={item.media}
                    eager={row === 0}
                    canLoad={firstRowDone}
                    onReady={() => markMoving(item.title)}
                  />
                </div>
                <div className='work-caption'>
                  <span className='work-title'>{item.title}</span>
                  <span className='work-meta'>{item.meta}</span>
                  <span className='visually-hidden'>, open the larger view</span>
                </div>
              </Reveal>
            ))}
          </div>
        ))}
      </div>
      {opened && <WorkViewer key={opened.item.title} opened={opened} onClose={() => setOpened(null)} />}
    </>
  );
}
