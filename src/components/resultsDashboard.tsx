import type { CSSProperties } from 'react';
import { Reveal } from './reveal';
import './component-styles/resultsDashboard.css';

// what the dashboard gives a client, in their words
const POINTS = [
  'See visitors arrive, live',
  'Know which pages bring enquiries',
  'Check in any time, from your phone',
];

// the visits line: a month, uneven but rising (an illustration, not data)
const LINE = [
  [0, 112], [40, 100], [80, 106], [120, 84], [160, 90], [200, 70],
  [240, 76], [280, 52], [320, 60], [360, 34], [400, 40],
];
const linePath = `M ${LINE.map(([x, y]) => `${x} ${y}`).join(' L ')}`;
const areaPath = `${linePath} L 400 130 L 0 130 Z`;

// where visitors come from: labels only, the bars show the shape
const SOURCES = [
  { name: 'Google', share: 0.86 },
  { name: 'Instagram', share: 0.58 },
  { name: 'Direct', share: 0.34 },
];

/**
 * "Your own dashboard": after the package ladder, the dashboard every
 * client gets, shown as a drawing of one. A dark browser window with a live
 * dot, a visits line that draws itself and source bars that grow when it
 * comes into view. Shapes only, no figures, so it never passes for a real
 * client's numbers.
 */
export function ResultsDashboard() {
  return (
    <div className='dash'>
      <div className='dash-copy'>
        <Reveal as="p" className='results-ladder-title dash-title'>
          <span>Your own dashboard.</span> <span>Live, any time.</span>
        </Reveal>
        <Reveal as="p" className='dash-text' delay={60}>
          Every site comes with a private link to its numbers. Open it whenever you like, and see exactly where your
          customers come from.
        </Reveal>
        <ul className='dash-points'>
          {POINTS.map((point, k) => (
            <Reveal as="li" key={point} delay={120 + k * 60}>{point}</Reveal>
          ))}
        </ul>
      </div>

      <Reveal as="div" className='dash-window' threshold={0.3} aria-hidden>
        <div className='dash-chrome'>
          <span className='dash-lights'><i /><i /><i /></span>
          <span className='dash-address'>yourbusiness.co.uk<span className='dash-range'> · last 30 days</span></span>
          <span className='dash-live'><i />Live</span>
        </div>

        <div className='dash-body'>
          <div className='dash-stats'>
            {['Visitors', 'Enquiries', 'Bookings'].map((label, k) => (
              <div key={label} className='dash-stat' style={{ '--k': k } as CSSProperties}>
                <span className='dash-stat-label'>{label}</span>
                <span className='dash-stat-value' />
              </div>
            ))}
          </div>

          <svg className='dash-chart' viewBox='0 0 400 130' preserveAspectRatio='none'>
            <path className='dash-area' d={areaPath} />
            <path className='dash-line' d={linePath} pathLength={1} />
          </svg>

          <div className='dash-sources'>
            <span className='dash-stat-label'>Top sources</span>
            {SOURCES.map((source, k) => (
              <div key={source.name} className='dash-source' style={{ '--k': k, '--share': source.share } as CSSProperties}>
                <span>{source.name}</span>
                <span className='dash-bar'><i /></span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
