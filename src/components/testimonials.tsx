import { useEffect, useRef, useState } from 'react';
import { testimonialsData } from '../data/testimonials';
import { SectionBar } from './sectionBar';
import './component-styles/testimonials.css';

// how much vertical scroll each pixel of sideways travel costs (lower = faster)
const SCROLL_RATIO = 0.6;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type RGB = [number, number, number];
const hex = (value: string): RGB => [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16)) as RGB;

/**
 * Two soft colour worlds spread across all the quotes: a warm stone, then a
 * pale cool mist. Both stay light and low in saturation so the dark text
 * always reads, and each has a base wash plus three gentle lights that drift
 * through it.
 */
const worlds = [
  { base: '#ebe4db', glows: ['#f8f4ef', '#dccfbf', '#f0dccf'] },
  { base: '#dde2ee', glows: ['#f1f3f9', '#c9d0e4', '#e8e1f0'] },
].map((w) => ({ base: hex(w.base), glows: w.glows.map(hex) }));
type World = (typeof worlds)[number];

const css = ([r, g, b]: RGB, alpha = 1) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${alpha})`;
const smooth = (k: number) => k * k * (3 - 2 * k);
const clamp01 = (k: number) => Math.min(1, Math.max(0, k));

// width of the soft edge on the sweeping front, as a share of the screen
const FEATHER = 0.5;

/**
 * Where we are between two worlds. Each world holds around its quote, then
 * the next one sweeps across. `front` is the sweep's leading edge, from just
 * off the right (1 + FEATHER) to just off the left (-FEATHER).
 */
function sweepAt(position: number, quotes: number) {
  const span = worlds.length - 1;
  const w = clamp01(quotes > 1 ? position / (quotes - 1) : 0) * span;
  const i = Math.min(span - 1, Math.floor(w));
  const k = smooth(clamp01((w - i - 0.12) / 0.76));
  const front = 1 + FEATHER - k * (1 + FEATHER * 2);
  return { from: worlds[i], to: worlds[i + 1], k, front };
}

/**
 * Testimonials as a scroll-pinned horizontal track inside a full-bleed
 * "colour world". The section is one screen tall plus the track's travel; its
 * frame pins to the viewport while vertical scroll slides the quotes right to
 * left, then unpins once the last quote is centred.
 *
 * Behind the quotes a living gradient (a tiny canvas, upscaled so it is
 * naturally soft) drifts on its own. Two soft colour worlds span the quotes;
 * the second sweeps in from the right as a soft, leaning front, travelling
 * with the quotes, so you can see the direction of the change. It is fixed behind the whole page rather than
 * inside the section: it washes in over the page before the section arrives
 * and drains away after it, so there is no edge where the section starts or
 * ends. The text stays dark throughout. With reduced motion there is
 * no pinning or drift: the quotes stack over a still gradient.
 */
export function Testimonials() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const [current, setCurrent] = useState(0);
  const [still] = useState(reducedMotion);
  const count = testimonialsData.length;

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    const track = trackRef.current;
    const canvas = canvasRef.current;
    const backdrop = backdropRef.current;
    const context = canvas?.getContext('2d');
    if (!section || !frame || !track || !canvas || !backdrop || !context) return;
    const panels = [...track.querySelectorAll<HTMLElement>('.tst-panel')];
    let distance = 0;
    let position = 0; // which quote is centred, fractional
    let enter = still ? 1 : 0; // how much of the colour is showing: 0 = plain page, 1 = full world
    let visible = false;
    let scrollId = 0;
    let measureId = 0;
    let loopId = 0;

    // the incoming world is painted here, then cut to the sweep's shape
    const layer = document.createElement('canvas');
    const layerContext = layer.getContext('2d');

    // A world: a base wash and a few soft lights, drawn tiny and stretched by
    // CSS, which blurs them for free. The lights drift with time and lean
    // against the direction the quotes travel; `arrive` pushes them in from
    // the right while their world is sweeping in.
    const paint = (ctx: CanvasRenderingContext2D, world: World, t: number, arrive: number) => {
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      ctx.fillStyle = css(world.base);
      ctx.fillRect(0, 0, w, h);
      const lean = position * 0.12 - arrive * 0.45;
      const lights = [
        { x: 0.22 + Math.sin(t * 0.21) * 0.12 - lean, y: 0.3 + Math.cos(t * 0.17) * 0.18, r: 0.75, a: 0.8 },
        { x: 0.8 + Math.cos(t * 0.15) * 0.14 - lean * 0.6, y: 0.72 + Math.sin(t * 0.19) * 0.15, r: 0.85, a: 0.7 },
        { x: 0.55 + Math.sin(t * 0.11 + 2) * 0.2 - lean * 0.3, y: 0.95 + Math.cos(t * 0.13) * 0.12, r: 0.5, a: 0.5 },
      ];
      lights.forEach((light, n) => {
        // wrap so lights that lean off the left come back in from the right
        const x = (((light.x % 1.4) + 1.4) % 1.4) * w;
        const y = light.y * h;
        const r = light.r * Math.max(w, h);
        const colour = world.glows[n];
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
        gradient.addColorStop(0, css(colour, light.a));
        gradient.addColorStop(1, css(colour, 0));
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });
    };

    // The current world fills the screen; the next one sweeps in over it
    // from the right as a soft, slightly diagonal front, moving the same way
    // as the quotes.
    const draw = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const t = still ? 0 : time / 1000;
      const sweep = sweepAt(position, panels.length);
      paint(context, sweep.from, t, 0);
      if (sweep.k > 0.001 && layerContext) {
        paint(layerContext, sweep.to, t, 1 - sweep.k);
        // cut the incoming world to everything right of the front, feathered
        layerContext.globalCompositeOperation = 'destination-in';
        // runs left to right across the front, tipped a little so the front
        // leans (top edge ahead of the bottom) as it travels
        const x0 = (sweep.front - FEATHER / 2) * w;
        const x1 = (sweep.front + FEATHER / 2) * w;
        const tilt = (x1 - x0) * 0.35;
        const edge = layerContext.createLinearGradient(x0, h / 2 + tilt, x1, h / 2 - tilt);
        edge.addColorStop(0, 'rgba(0, 0, 0, 0)');
        edge.addColorStop(1, 'rgba(0, 0, 0, 1)');
        layerContext.fillStyle = edge;
        layerContext.fillRect(0, 0, w, h);
        layerContext.globalCompositeOperation = 'source-over';
        context.drawImage(layer, 0, 0);
      }

      // the backdrop fades in and out with the section, so there is no edge
      backdrop.style.opacity = String(enter);
    };

    const loop = (time: number) => {
      if (enter > 0) draw(time);
      if (visible) loopId = requestAnimationFrame(loop);
    };

    const update = () => {
      if (!still) {
        const padTop = parseFloat(getComputedStyle(section).paddingTop) || 0;
        const top = section.getBoundingClientRect().top + padTop;
        const travel = distance * SCROLL_RATIO;
        const progress = travel > 0 ? Math.min(1, Math.max(0, -top / travel)) : 0;
        // The colour washes over the whole page across the screen and a bit
        // before the pin, and drains back out over the screen after it, so
        // the section has no visible start or end.
        const arriving = smooth(Math.min(1, Math.max(0, 1 - top / (window.innerHeight * 1.15))));
        // A section after this one can hold the colour (data-backdrop-hold):
        // then it drains only once that section has finished, else as soon
        // as the last quote has passed.
        const hold = document.querySelector<HTMLElement>('[data-backdrop-hold]');
        const past = hold ? window.innerHeight - hold.getBoundingClientRect().bottom : -top - travel;
        const leaving = smooth(Math.min(1, Math.max(0, past / (window.innerHeight * 0.85))));
        enter = arriving * (1 - leaving);
        // set here, not only when drawing: the loop skips drawing at 0, which
        // would otherwise leave the last opacity stuck on screen
        backdrop.style.opacity = String(enter);
        track.style.transform = `translate3d(${-progress * distance}px, 0, 0)`;

        // one progress drives the quotes, the counter, the bar and the colour
        position = progress * (panels.length - 1);
        // one segment per quote, each tracking your progress through that
        // quote: it starts filling as its quote arrives, is half full while
        // the quote is centred, and completes as it leaves; all empty at the
        // start of the section, all full at the end
        const segments = barRef.current?.querySelectorAll<HTMLElement>('.tst-segment-fill') ?? [];
        segments.forEach((segment, index) => {
          const fill = Math.min(1, Math.max(0, progress * segments.length - index));
          // Clip the fill to its length with a rounded inset rather than sliding
          // it inside an overflow-hidden track: that leaves anti-aliasing specks
          // in Chrome. An empty segment doesn't paint its fill at all.
          segment.style.visibility = fill > 0.001 ? 'visible' : 'hidden';
          segment.style.clipPath = `inset(0 ${((1 - fill) * 100).toFixed(3)}% 0 0 round 999px)`;
        });
        panels.forEach((panel, index) => {
          const offset = index - position;
          // fully crisp across the middle stretch, fading only beyond it
          const focus = Math.min(1, Math.max(0, (1 - Math.abs(offset) - 0.18) / 0.62));
          const soft = 1 - focus;
          panel.style.opacity = String(0.14 + focus * 0.86);
          panel.style.transform = soft > 0.02
            ? `translateY(${(soft * 24).toFixed(1)}px) scale(${(1 - soft * 0.04).toFixed(3)})`
            : 'none';
        });
        setCurrent(Math.round(position));
      }
      if (!visible || still) draw(performance.now());
    };

    // Centre the first and last quotes, then size the section: one pinned
    // screen plus the sideways travel, so the pin ends exactly as the last
    // quote centres.
    const measure = () => {
      // ~1/12 resolution: plenty for something this soft, and cheap to redraw
      canvas.width = layer.width = Math.max(48, Math.round(window.innerWidth / 12));
      canvas.height = layer.height = Math.max(32, Math.round(window.innerHeight / 12));
      if (!still) {
        const inset = Math.max(0, (frame.clientWidth - panels[0].offsetWidth) / 2);
        track.style.paddingLeft = track.style.paddingRight = `${inset}px`;
        // centre of the first quote to centre of the last, from layout offsets
        distance = Math.max(0, panels[panels.length - 1].offsetLeft - panels[0].offsetLeft);
        section.style.height = `${distance * SCROLL_RATIO + frame.offsetHeight}px`;
      }
      update();
    };

    const onScroll = () => {
      cancelAnimationFrame(scrollId);
      scrollId = requestAnimationFrame(update);
    };
    const remeasure = () => {
      cancelAnimationFrame(measureId);
      measureId = requestAnimationFrame(measure);
    };

    // only keep the drift running while the section is on screen
    // (with a margin, since the colour starts washing in before the section arrives)
    // (watching any section that holds the colour too, so it keeps drifting)
    const onScreen = new Set<Element>();
    const seen = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? onScreen.add(entry.target) : onScreen.delete(entry.target)));
      visible = onScreen.size > 0 && !still;
      cancelAnimationFrame(loopId);
      if (visible) loopId = requestAnimationFrame(loop);
    }, { rootMargin: '120% 0px 100% 0px' });
    seen.observe(section);
    document.querySelectorAll('[data-backdrop-hold]').forEach((element) => seen.observe(element));

    // re-measure whenever anything changes size (late fonts, wrapping, a hot
    // reload, Safari's toolbar), so the height never goes stale
    const resized = new ResizeObserver(remeasure);
    resized.observe(frame);
    panels.forEach((panel) => resized.observe(panel));
    document.fonts?.ready.then(remeasure);
    remeasure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    return () => {
      cancelAnimationFrame(scrollId);
      cancelAnimationFrame(measureId);
      cancelAnimationFrame(loopId);
      seen.disconnect();
      resized.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      section.style.height = '';
    };
  }, [still]);

  return (
    <section className={`tst${still ? ' is-still' : ''}`} ref={sectionRef} aria-label="What people I've worked with say">
      {/* fixed behind the whole page, faded in and out by scroll */}
      <div className='tst-backdrop' ref={backdropRef} aria-hidden>
        <canvas className='tst-canvas' ref={canvasRef} />
        <div className='tst-grain' />
      </div>

      <div className='tst-frame' ref={frameRef}>

        <div className='tst-inner'>
          <SectionBar label="People I've worked with" className='tst-head' reveal={false}>
            <span className='tst-count'>
              {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
          </SectionBar>

          <div className='tst-track' ref={trackRef}>
            {testimonialsData.map((item, index) => (
              <figure key={index} className='tst-panel'>
                <blockquote className='tst-text'>
                  <span className='tst-mark' aria-hidden>“</span>
                  {item.quote}
                  <span className='tst-mark' aria-hidden>”</span>
                </blockquote>
                <figcaption className='tst-cite'>
                  {item.name}<i>·</i>{item.business}
                  {item.result && <em>{item.result}</em>}
                  <span className='tst-rel'>{item.relationship}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className='tst-progress' ref={barRef} aria-hidden>
            {testimonialsData.map((_, index) => (
              <span key={index} className='tst-segment'>
                <span className='tst-segment-fill' />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
