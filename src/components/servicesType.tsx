import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { servicesData } from '../data/services';
import { toolsData, appMark } from '../data/tools';
import { workData } from '../data/work';
import { Reveal } from './reveal';
import { ToolIcon } from './toolIcon';
import OssaHero from '../assets/project-images/services/ossa-1-hero.webp';
import OssaNew from '../assets/project-images/services/ossa-3-new.webp';
import OssaReviews from '../assets/project-images/services/ossa-8-reviews.webp';
import PrimeStockQuote from '../assets/project-images/services/primestock-6-quote-form.webp';
import KapeHero from '../assets/project-images/services/kape-1-hero.webp';
import './component-styles/servicesType.css';

// The tools behind Hosting & Care, as app icons in their own colours (the
// same tiles as the tools section's, from data/tools.ts), in two sets of
// three: what runs the site, and what watches over it. The slots take turns
// swapping to the other set, one every beat, with the hero icons' dip and pop.
const hostingSets = [
  ['Cloudflare', 'Vercel', 'Supabase'],
  ['Google Search Console', 'Google Analytics', 'Microsoft Clarity'],
].map((set) => set.map((name) => toolsData.find((tool) => tool.name === name)!));
const APP_BEAT_MS = 3000;
// the new icon goes in at the bottom of the dip (see svcs-app-swap)
const APP_DIP_MS = 180;

function HostingIcons() {
  const box = useRef<HTMLDivElement>(null);
  // per slot: which set it shows, and how many swaps it's made (to replay
  // the animation each time)
  const [shown, setShown] = useState([0, 0, 0]);
  const [swaps, setSwaps] = useState([0, 0, 0]);

  useEffect(() => {
    const el = box.current;
    if (!el || reducedMotion()) return;
    let beat = 0;
    let timer = 0;
    const dips: number[] = [];
    const tick = () => {
      const slot = beat % 3;
      beat += 1;
      setSwaps((all) => all.map((n, i) => (i === slot ? n + 1 : n)));
      dips.push(window.setTimeout(() => setShown((all) => all.map((set, i) => (i === slot ? 1 - set : set))), APP_DIP_MS));
    };
    // only while the card is on screen
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(tick, APP_BEAT_MS);
    }, { threshold: 0.25 });
    observer.observe(el);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      dips.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <div className='svcs-apps' ref={box}>
      {shown.map((set, slot) => {
        const tool = hostingSets[set][slot];
        const swap = swaps[slot] === 0 ? '' : swaps[slot] % 2 ? ' is-swap-a' : ' is-swap-b';
        return (
          <span key={slot} className='svcs-app'>
            <span className={`svcs-app-tile${swap}`} style={{ '--app-bg': tool.app.tile } as CSSProperties}>
              <ToolIcon tool={appMark(tool)} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

// New Websites plays the sites' reels one after another, each for a few
// seconds before cross-fading into the next. Some reels open on a bare
// moment (a photo still loading, a headline blurring in), so those start a
// beat in.
const reels = workData.filter((item) => item.media.type === 'video');
const REEL_START: Record<string, number> = { 'Ossa Pilates': 1.2, 'Kape Coffee': 1.5 };
const REEL_MS = 7000;
// matches the cross-fade in servicesType.css
const FADE_MS = 800;

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function SiteReels() {
  const box = useRef<HTMLDivElement>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [onScreen, setOnScreen] = useState(false);

  // only while the card is on screen
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // play the current reel from its start; after a while, hand over to the
  // next, and once the fade is done, stop the one that's gone
  useEffect(() => {
    const all = videos.current;
    if (!onScreen || reducedMotion()) {
      all.forEach((video) => video?.pause());
      return;
    }
    const video = all[current];
    if (video) {
      video.currentTime = REEL_START[reels[current].title] ?? 0;
      video.play().catch(() => {});
    }
    const stopOthers = window.setTimeout(() => {
      all.forEach((other, index) => index !== current && other?.pause());
    }, FADE_MS);
    const next = window.setTimeout(() => setCurrent((index) => (index + 1) % reels.length), REEL_MS);
    return () => {
      window.clearTimeout(stopOthers);
      window.clearTimeout(next);
    };
  }, [current, onScreen]);

  return (
    <div className='svcs-reels' ref={box}>
      {reels.map((item, index) => (
        <video
          key={item.title}
          ref={(el) => {
            videos.current[index] = el;
          }}
          className={`svcs-site svcs-reel${index === current ? ' is-on' : ''}`}
          src={item.media.src}
          poster={item.media.poster}
          muted
          playsInline
          preload={onScreen ? 'auto' : 'none'}
        />
      ))}
    </div>
  );
}

const phone = (src: string, className = '') => <img className={`svcs-phone ${className}`} src={src} alt='' loading='lazy' decoding='async' />;

// Each service's picture, from the sites already built (in the order of
// data/services.ts): a desktop page, phones from the mobile sites, and the
// hosting tools' icons.
const visuals: { kind: string; content: ReactNode }[] = [
  // New Websites: the sites' reels in turn, running off the card's edge
  { kind: 'site', content: <SiteReels /> },
  // Redesigns: one phone
  { kind: 'phone', content: phone(OssaHero) },
  // Leads & Bookings: three phones, each a way in (book a first class, ask
  // for a quote, order now), sliding right to left on an endless loop: the
  // track holds them twice and moves by one set, so the join never shows
  {
    kind: 'phones',
    content: (
      <div className='svcs-phones-track'>
        {[OssaNew, PrimeStockQuote, KapeHero, OssaNew, PrimeStockQuote, KapeHero].map((src, index) => (
          <img key={index} className='svcs-phone' src={src} alt='' loading='lazy' decoding='async' />
        ))}
      </div>
    ),
  },
  // Getting Found: the Google rating
  { kind: 'phone', content: phone(OssaReviews) },
  // Hosting & Care: the tools that keep it running, as a fan of app icons
  {
    kind: 'icons',
    content: <HostingIcons />,
  },
];

/**
 * The services: the centred poster headline, then a card per service, its
 * name on top and a picture of the work below it, rising from the card's
 * foot (three across, then two wider ones). Each service's points
 * (data/services.ts) aren't shown here; they're kept for later.
 */
export function ServicesType() {
  return (
    <section className='svcs' aria-labelledby='svcs-title'>
      <Reveal as='h2' className='svcs-headline' id='svcs-title'>
        <span>Everything your</span> <span>website needs.</span>
      </Reveal>

      <ul className='svcs-grid'>
        {servicesData.map((service, index) => {
          const visual = visuals[index % visuals.length];
          return (
            <Reveal as='li' key={service.title} className='svcs-card' delay={(index % 3) * 80}>
              <h3 className='svcs-card-title'>{service.title}</h3>
              <div className={`svcs-visual is-${visual.kind}`} aria-hidden>
                {visual.content}
              </div>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
