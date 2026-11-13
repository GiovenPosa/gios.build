import type { CSSProperties, ReactNode } from 'react';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { Reveal } from './reveal';
import './component-styles/resultsDashboard.css';

// visitors landing, one after another: the page they came in on, and from where
const ARRIVALS = [
  { page: '/', from: 'Google' },
  { page: '/services', from: 'Instagram' },
  { page: '/contact', from: 'Google' },
  { page: '/about', from: 'direct' },
];

// enquiries by page: labels only, the bars show the shape
const PAGES = [
  { page: '/services', share: 0.86 },
  { page: '/', share: 0.58 },
  { page: '/about', share: 0.3 },
];

const ANYTIME = ['Opens on your phone', 'Nothing to install', 'Live, whenever you look'];

function LiveScreen() {
  return (
    <div className='dash-term-body'>
      <p className='dash-term-comment'>// yourbusiness.co.uk</p>
      <p className='dash-term-line'>
        <span className='dash-live'><i /></span> Live now
      </p>
      <ul className='dash-term-list'>
        {ARRIVALS.map((arrival, i) => (
          <li key={arrival.page} style={{ '--i': i } as CSSProperties}>
            <span className='dash-term-ok'>+</span> {arrival.page}{' '}
            <span className='dash-term-comment'>from {arrival.from}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WorksScreen() {
  return (
    <div className='dash-term-body'>
      <p className='dash-term-comment'>/* enquiries by page */</p>
      <ul className='dash-term-bars'>
        {PAGES.map((row, i) => (
          <li key={row.page} style={{ '--i': i, '--share': row.share } as CSSProperties}>
            <span>{row.page}</span>
            <span className='dash-bar'><i /></span>
          </li>
        ))}
      </ul>
      <p className='dash-term-line dash-term-note'>
        <span className='dash-term-comment'>// build on what works</span>
      </p>
    </div>
  );
}

function AnytimeScreen() {
  return (
    <div className='dash-term-body'>
      <p className='dash-term-comment'>// your private link</p>
      <p className='dash-term-line'>
        <span className='dash-term-key'>open</span> yourbusiness.co.uk/stats
      </p>
      <ul className='dash-term-list'>
        {ANYTIME.map((line, i) => (
          <li key={line} style={{ '--i': i } as CSSProperties}>
            <span className='dash-term-ok'>✓</span> {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS: { title: string; text: string; Screen: () => ReactNode }[] = [
  { title: 'See them arrive', text: 'Watch visitors land as it happens, and see where each one came from.', Screen: LiveScreen },
  { title: 'Know what works', text: 'See which pages bring enquiries, so we know what to build on next.', Screen: WorksScreen },
  { title: 'Check in anytime', text: 'A private link to your numbers. Open it whenever you like, from your phone.', Screen: AnytimeScreen },
];

function Step({ index }: { index: number }) {
  // each window plays its own lines in as it comes into view
  const { ref, isVisible } = useInViewOnce<HTMLLIElement>(0.4);
  const { title, text, Screen } = STEPS[index];
  return (
    <li ref={ref} className={`dash-step${isVisible ? ' is-playing' : ''}`}>
      <div className='dash-term' aria-hidden>
        <div className='dash-term-bar'>
          <i />
          <i />
          <i />
        </div>
        <Screen />
      </div>
      <p className='dash-step-number'>0{index + 1}</p>
      <h3 className='dash-step-title'>{title}</h3>
      <p className='dash-step-text'>{text}</p>
    </li>
  );
}

/**
 * "Your own dashboard": after the tracked points, the dashboard every client
 * gets, on a dark band like the UI page's "Pull. Theme. Own it.": the
 * headline centred, then three small windows, one for each thing it does,
 * each with its number, title and a line under it. Shapes and labels only,
 * no figures, so it never passes for a real client's numbers.
 */
export function ResultsDashboard() {
  return (
    <section className='dash' data-header-dark aria-labelledby='dash-title'>
      <Reveal as='h2' className='dash-title' id='dash-title'>
        <span>Your own dashboard.</span> <span>Live, any time.</span>
      </Reveal>
      <Reveal as='p' className='dash-sub' delay={60}>
        Every site comes with a private link to its numbers. Open it whenever you like, and see exactly where your
        customers come from.
      </Reveal>
      <ol className='dash-steps'>
        {STEPS.map((step, i) => (
          <Step key={step.title} index={i} />
        ))}
      </ol>
    </section>
  );
}
