import { useRef } from 'react';
import { capsule, easeInOut, lerp, settle, span, useArtTimeline } from './artTimeline';

// ---- the drawing: a 210 x 100 box. Deep forest line on soft sage ----
const INK = '#1f3b2c';
const C = { x: 105, y: 53 };

// the one shape: an envelope that becomes a calendar
const ENVELOPE = { w: 50, h: 34, r: 7 };
const CALENDAR = { w: 58, h: 54, r: 10 };
const STROKE = 4;

// a closed rounded outline, centred on (cx, cy), for stroking
const outline = (cx: number, cy: number, w: number, h: number, r: number) => {
  const x = cx - w / 2;
  const y = cy - h / 2;
  return `M ${x + r} ${y} H ${x + w - r} A ${r} ${r} 0 0 1 ${x + w} ${y + r} V ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h} H ${x + r} A ${r} ${r} 0 0 1 ${x} ${y + h - r} V ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

// the calendar's date grid, and the one that gets booked
const COLS = [-14, 0, 14];
const ROWS = [7, 19];
const BOOKED = { col: 1, row: 1 };

const DURATION = 3.4;

/**
 * Leads & Bookings: "an enquiry becomes a booking". An envelope glides in
 * and settles; its flap flattens into a header line as it grows into a
 * calendar, two binding rings popping on top; the dates appear, and one of
 * them swells into a booked slot with a tick. In the diary.
 */
export function BookingArt({ active }: { active: boolean }) {
  const r = useRef<{
    shape: SVGPathElement | null;
    flap: SVGPathElement | null;
    rings: (SVGPathElement | null)[];
    dates: (SVGPathElement | null)[];
    check: SVGPathElement | null;
  }>({ shape: null, flap: null, rings: [], dates: [], check: null }).current;

  const svg = useArtTimeline(active, DURATION, (t) => {
    // beat 1: the envelope glides in on a soft arc and settles
    const arrive = settle(span(t, 0.05, 0.8), 0.04);
    const x = lerp(C.x - 46, C.x, arrive);
    const y = C.y - Math.sin(arrive * Math.PI) * 6;
    // beat 2: it grows into the calendar
    const unfold = easeInOut(span(t, 1.05, 1.85));
    const w = lerp(ENVELOPE.w, CALENDAR.w, unfold);
    const h = lerp(ENVELOPE.h, CALENDAR.h, unfold);
    const radius = lerp(ENVELOPE.r, CALENDAR.r, unfold);
    const top = y - h / 2;
    if (r.shape) {
      r.shape.setAttribute('d', outline(x, y, w, h, radius));
      r.shape.style.opacity = String(span(t, 0.05, 0.25));
    }
    // the flap: a V from the top corners, flattening into the header line
    if (r.flap) {
      const inset = lerp(4, 0, unfold);
      const depth = lerp(15, 0, unfold);
      const lineY = lerp(top + 2, top + 15, unfold);
      const left = x - w / 2 + inset + STROKE / 2;
      const right = x + w / 2 - inset - STROKE / 2;
      r.flap.setAttribute('d', `M ${left} ${lineY} L ${x} ${lineY + depth} L ${right} ${lineY}`);
      r.flap.style.opacity = String(span(t, 0.05, 0.25));
    }
    // the binding rings pop up on top as it lands
    r.rings.forEach((ring, i) => {
      if (!ring) return;
      const k = settle(span(t, 1.6 + i * 0.08, 1.95 + i * 0.08), 0.15);
      const ringX = x + (i === 0 ? -14 : 14);
      ring.setAttribute('d', `M ${ringX} ${top - 5 * k} V ${top + 5 * k}`);
      ring.style.opacity = k > 0.01 ? '1' : '0';
    });

    // beat 3: the dates appear, then one swells into the booked slot
    const book = settle(span(t, 2.55, 2.95), 0.08);
    r.dates.forEach((date, i) => {
      if (!date) return;
      const col = i % COLS.length;
      const row = Math.floor(i / COLS.length);
      const appear = settle(span(t, 1.95 + i * 0.06, 2.25 + i * 0.06), 0.2);
      const isBooked = col === BOOKED.col && row === BOOKED.row;
      const size = 5.2 * appear;
      const dw = isBooked ? lerp(size, 17, book) : size;
      const dh = isBooked ? lerp(size, 11, book) : size;
      date.setAttribute('d', capsule(x + COLS[col], top + 15 + ROWS[row] + 3, dw, dh, isBooked ? lerp(dw / 2, 4, book) : undefined));
      date.style.opacity = appear > 0.01 ? (isBooked ? '1' : String(lerp(1, 0.4, book))) : '0';
    });
    if (r.check) {
      const k = easeInOut(span(t, 2.85, 3.25));
      const cx = x + COLS[BOOKED.col];
      const cy = top + 15 + ROWS[BOOKED.row] + 3;
      r.check.setAttribute('d', `M ${cx - 3.6} ${cy + 0.2} L ${cx - 1} ${cy + 2.6} L ${cx + 3.8} ${cy - 2.4}`);
      const length = 13;
      r.check.style.strokeDasharray = `${length}`;
      r.check.style.strokeDashoffset = `${length * (1 - k)}`;
      r.check.style.opacity = k > 0.001 ? '1' : '0';
    }
  });

  return (
    <svg className='svc-art' ref={svg} viewBox='0 0 210 100' aria-hidden>
      <path ref={(el) => { r.shape = el; }} fill='none' stroke={INK} strokeWidth={STROKE} strokeLinejoin='round' opacity='0' />
      <path ref={(el) => { r.flap = el; }} fill='none' stroke={INK} strokeWidth={STROKE} strokeLinecap='round' strokeLinejoin='round' opacity='0' />
      {[0, 1].map((i) => (
        <path key={i} ref={(el) => { r.rings[i] = el; }} fill='none' stroke={INK} strokeWidth={STROKE} strokeLinecap='round' opacity='0' />
      ))}
      {ROWS.flatMap((_, row) => COLS.map((__, col) => row * COLS.length + col)).map((i) => (
        <path key={i} ref={(el) => { r.dates[i] = el; }} fill={INK} opacity='0' />
      ))}
      <path ref={(el) => { r.check = el; }} fill='none' stroke='#fff' strokeWidth='2.2' strokeLinecap='round' strokeLinejoin='round' opacity='0' />
    </svg>
  );
}
