import { useId } from 'react';

// The three results cards' illustrations: still objects, one per layer,
// drawn as a family. Each has a soft body with a light top edge and casts a
// long, soft shadow down and to the right onto its card's colour.
// All share a 240 x 200 box.

const FONT = 'JakartaMedium, sans-serif';

/** A soft shadow under a shape: the same shape, offset, blurred, tinted. */
function Shadow({ id, tint, dx = 12, dy = 16, blur = 11, opacity = 0.32 }: {
  id: string; tint: string; dx?: number; dy?: number; blur?: number; opacity?: number;
}) {
  return (
    // drawn over the whole picture (not the shape's own box, which would cut
    // the soft edge off flat), in sRGB so it blends exactly with the card
    <filter id={id} filterUnits='userSpaceOnUse' x='-60' y='-60' width='360' height='320' colorInterpolationFilters='sRGB'>
      <feGaussianBlur in='SourceAlpha' stdDeviation={blur} />
      <feOffset dx={dx} dy={dy} result='blur' />
      <feFlood floodColor={tint} floodOpacity={opacity} />
      <feComposite in2='blur' operator='in' />
      <feMerge>
        <feMergeNode />
        <feMergeNode in='SourceGraphic' />
      </feMerge>
    </filter>
  );
}

/** Technical, "Built right.": line-drawn devices in one ink, each showing
 *  on its screen the promise it stands for: the phone, speed; the laptop,
 *  a secure site; the tablet, a form that's been tested. Two small solid
 *  icons fill the gaps: easy for anyone, and checked. The outer devices run
 *  off the card's edges. */
export function BuiltRightIcon() {
  const ink = '#ffffff';
  const card = '#7cc4e4'; // cut-outs in the solid icons show the card through
  const line = { fill: 'none', stroke: ink, strokeWidth: 4.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  return (
    <svg className='lens-icon' viewBox='0 0 240 200' aria-hidden>
      {/* the laptop, off the left edge: a padlock on its screen */}
      <rect x='-34' y='72' width='96' height='62' rx='9' {...line} />
      <path d='M -44 147 H 74' {...line} />
      <rect x='15' y='100' width='26' height='20' rx='4.5' {...line} strokeWidth={4} />
      <path d='M 20 100 V 94 a 8 8 0 0 1 16 0 V 100' {...line} strokeWidth={4} />

      {/* the phone, in the middle: speed */}
      <rect x='88' y='38' width='64' height='122' rx='15' {...line} />
      <path d='M 110 149 H 130' {...line} />
      <path d='M 126 68 L 109 101 H 122 L 115 130 L 133 94 H 120 Z' fill={ink} stroke={ink} strokeWidth='2' strokeLinejoin='round' />

      {/* the tablet, off the right edge: a form, ticked */}
      <rect x='172' y='64' width='96' height='78' rx='11' {...line} />
      <path d='M 188 86 H 236 M 188 102 H 222' {...line} strokeWidth={4} />
      <path d='M 189 120 L 195 126 L 207 114' {...line} strokeWidth={4} />

      {/* easy for anyone: the accessibility mark, solid */}
      <circle cx='44' cy='34' r='16' fill={ink} />
      <circle cx='44' cy='25.5' r='2.6' fill={card} />
      <path d='M 35 31 H 53 M 44 31 V 38.5 M 44 38.5 L 39.5 46 M 44 38.5 L 48.5 46' fill='none' stroke={card} strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />

      {/* checked: a solid badge */}
      <circle cx='200' cy='30' r='14' fill={ink} />
      <path d='M 193.5 30 L 198 34.5 L 206.5 26' fill='none' stroke={card} strokeWidth='3.4' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

/** Experience, "Easy to use.": the button, and a pointer tapping its
 *  arrow. One tap and you're in touch. */
export function TapIcon() {
  const id = useId();
  const B = { x: 24, y: 72, w: 192, h: 58 };
  const D = { x: B.x + B.w - 31, y: B.y + B.h / 2, r: 21 }; // the arrow's disc
  // the pointer's tip lands just inside the disc
  const P = { x: D.x + 7, y: D.y + 7 };
  const pointer = `M ${P.x} ${P.y} L ${P.x} ${P.y + 34} L ${P.x + 8.4} ${P.y + 26.6} L ${P.x + 14.2} ${P.y + 39.6} L ${P.x + 20.4} ${P.y + 36.8} L ${P.x + 14.6} ${P.y + 24} L ${P.x + 25.6} ${P.y + 23.6} Z`;
  return (
    <svg className='lens-icon' viewBox='0 0 240 200' aria-hidden>
      <defs>
        <Shadow id={`${id}s`} tint='#17602a' opacity={0.38} />
        <Shadow id={`${id}p`} tint='#0b3a17' dx={4} dy={6} blur={4} opacity={0.3} />
        <linearGradient id={`${id}btn`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#262626' />
          <stop offset='1' stopColor='#030303' />
        </linearGradient>
        {/* a sheen that fades down the top half, instead of a hard edge */}
        <linearGradient id={`${id}sheen`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#ffffff' stopOpacity='0.16' />
          <stop offset='0.5' stopColor='#ffffff' stopOpacity='0' />
        </linearGradient>
        <radialGradient id={`${id}disc`} cx='0.4' cy='0.3' r='0.8'>
          <stop offset='0' stopColor='#ffffff' />
          <stop offset='1' stopColor='#e9e9e9' />
        </radialGradient>
      </defs>

      <g filter={`url(#${id}s)`}>
        <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={B.h / 2} fill={`url(#${id}btn)`} />
      </g>
      <rect x={B.x} y={B.y} width={B.w} height={B.h} rx={B.h / 2} fill={`url(#${id}sheen)`} />
      <rect x={B.x + 0.5} y={B.y + 0.5} width={B.w - 1} height={B.h - 1} rx={(B.h - 1) / 2} fill='none' stroke='#ffffff' strokeOpacity='0.08' />

      <text x={B.x + 26} y={B.y + 35.5} fontFamily={FONT} fontSize='17' fill='#ffffff' letterSpacing='-0.2'>Get in touch</text>

      {/* the arrow, in a white disc at the button's end */}
      <circle cx={D.x} cy={D.y} r={D.r} fill={`url(#${id}disc)`} />
      <path
        d={`M ${D.x - 5.5} ${D.y + 5.5} L ${D.x + 5.5} ${D.y - 5.5} M ${D.x - 3.5} ${D.y - 5.5} H ${D.x + 5.5} V ${D.y + 3.5}`}
        fill='none'
        stroke='#111111'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />

      <g filter={`url(#${id}p)`}>
        <path d={pointer} fill='#ffffff' stroke='#141414' strokeWidth='1.6' strokeLinejoin='round' />
      </g>
    </svg>
  );
}

/** Business, "Brings work in.": a tile of rising bars, and a new enquiry arriving. */
export function GrowthIcon() {
  const id = useId();
  const T = { x: 60, y: 36, s: 120 };
  const BARS = [0.34, 0.5, 0.66, 0.92];
  const barW = 15;
  const gap = 9;
  const left = T.x + (T.s - (BARS.length * barW + (BARS.length - 1) * gap)) / 2;
  const floor = T.y + T.s - 24;
  const top = T.y + 30;
  return (
    <svg className='lens-icon' viewBox='0 0 240 200' aria-hidden>
      <defs>
        <Shadow id={`${id}s`} tint='#33452b' opacity={0.3} />
        <Shadow id={`${id}b`} tint='#8f1d0d' dx={3} dy={5} blur={4} opacity={0.35} />
        <linearGradient id={`${id}tile`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#ffffff' />
          <stop offset='1' stopColor='#eef2ea' />
        </linearGradient>
        <linearGradient id={`${id}bar`} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0' stopColor='#2f5a43' />
          <stop offset='1' stopColor='#1f3b2c' />
        </linearGradient>
      </defs>

      <g filter={`url(#${id}s)`}>
        <rect x={T.x} y={T.y} width={T.s} height={T.s} rx='30' fill={`url(#${id}tile)`} />
      </g>
      <rect x={T.x + 0.5} y={T.y + 0.5} width={T.s - 1} height={T.s - 1} rx='29.5' fill='none' stroke='#ffffff' />

      {/* the bars: the earlier ones pale, the newest one deep forest green */}
      {BARS.map((h, i) => {
        const height = (floor - top) * h;
        const last = i === BARS.length - 1;
        return (
          <rect
            key={i}
            x={left + i * (barW + gap)}
            y={floor - height}
            width={barW}
            height={height}
            rx='7.5'
            fill={last ? `url(#${id}bar)` : '#dbe4d4'}
          />
        );
      })}
      <line x1={T.x + 18} y1={floor + 8} x2={T.x + T.s - 18} y2={floor + 8} stroke='#dbe4d4' strokeWidth='2' strokeLinecap='round' />

      {/* the new enquiry: the site's red, on the tile's corner */}
      <g filter={`url(#${id}b)`}>
        <circle cx={T.x + T.s - 6} cy={T.y + 6} r='19' fill='#fe432a' />
      </g>
      <circle cx={T.x + T.s - 6} cy={T.y + 6} r='19' fill='none' stroke='#ffffff' strokeWidth='3' />
      <text x={T.x + T.s - 6} y={T.y + 12} textAnchor='middle' fontFamily={FONT} fontSize='16' fill='#ffffff'>+1</text>
    </svg>
  );
}
