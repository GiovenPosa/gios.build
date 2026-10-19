import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GoArrowUpRight } from 'react-icons/go';
import { packagesData, formatPrice, priceRange } from '../data/packages';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import { Reveal } from './reveal';
import { SectionBar } from './sectionBar';
import './component-styles/quoteBuilder.css';

// Each answer is something one of the packages includes; the build needs
// the highest package any answer calls for. Prices only ever come from the
// packages themselves, so the estimate is always one of their real ranges.
interface Choice {
  id: string;
  label: string;
  /** the package that includes it: 0 Starter, 1 Redesign, 2 Growth; none for care */
  tier?: number;
  /** the package item it is, so the receipt doesn't list it twice */
  covers?: string;
}

interface Question {
  id: string;
  title: string;
  multi?: boolean;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    id: 'start',
    title: 'Where are you starting?',
    choices: [
      { id: 'fresh', label: 'Starting fresh', tier: 0 },
      { id: 'existing', label: 'I have a site already', tier: 1 },
    ],
  },
  {
    id: 'size',
    title: 'How much do you need?',
    choices: [
      { id: 'one', label: 'One page', tier: 0 },
      { id: 'few', label: 'A few pages', tier: 2, covers: 'Multiple pages' },
    ],
  },
  {
    id: 'contact',
    title: 'How should people get in touch?',
    choices: [
      { id: 'simple-form', label: 'Simple contact form', tier: 0 },
      { id: 'detailed-form', label: 'Detailed enquiry form', tier: 2, covers: 'Detailed enquiry forms' },
    ],
  },
  {
    id: 'extras',
    title: 'Anything else?',
    multi: true,
    choices: [
      { id: 'bookings', label: 'Take bookings', tier: 2, covers: 'Bookings, maps & integrations' },
      { id: 'tools', label: 'Connect my tools', tier: 2, covers: 'Bookings, maps & integrations' },
      { id: 'seo', label: 'Get found on Google', tier: 2, covers: 'SEO foundations & analytics' },
      { id: 'care', label: 'Look after it for me' },
    ],
  },
];

const START: Record<string, string[]> = {
  start: ['fresh'],
  size: ['one'],
  contact: ['simple-form'],
  extras: [],
};

/** Counts from the last figure to the new one in a few quick ticks. */
function useTicker(target: number) {
  const [shown, setShown] = useState(target);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    // with reduced motion it lands in a single tick
    const steps = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 8;
    let step = 0;
    const id = window.setInterval(() => {
      step += 1;
      // eased, so the ticks bunch up as it lands
      const k = 1 - Math.pow(1 - step / steps, 3);
      setShown(Math.round((start + (target - start) * k) / 10) * 10);
      if (step >= steps) {
        window.clearInterval(id);
        setShown(target);
      }
    }, 45);
    from.current = target;
    return () => window.clearInterval(id);
  }, [target]);

  return shown;
}

const TIER_TAGS = ['Starter', 'Redesign', 'Growth'];

/**
 * "Not sure which fits?": a few quick questions on the left, and a receipt
 * on the right that prints a line for every answer and totals up to the
 * package the build needs. "Ask about this build" opens the booking form with
 * that package chosen and the answers already in the message.
 */
export function QuoteBuilder() {
  const { openBooking } = useBooking();
  const [answers, setAnswers] = useState(START);
  const receiptRef = useRef<HTMLDivElement>(null);

  // every change feeds the receipt through a touch, like it's printing
  const nudge = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    receiptRef.current?.animate(
      [{ translate: '0 0' }, { translate: '0 6px' }, { translate: '0 0' }],
      { duration: 360, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
    );
  };

  const used = useRef(false);

  const toggle = (question: Question, choice: Choice) => {
    // counted once per visit: someone started pricing their build
    if (!used.current) {
      used.current = true;
      track('Use quote builder');
    }
    setAnswers((prev) => {
      const current = prev[question.id];
      const next = question.multi
        ? current.includes(choice.id)
          ? current.filter((id) => id !== choice.id)
          : [...current, choice.id]
        : [choice.id];
      return { ...prev, [question.id]: next };
    });
    nudge();
  };

  const picked = QUESTIONS.flatMap((question) =>
    question.choices.filter((choice) => answers[question.id].includes(choice.id))
  );
  const tier = Math.max(0, ...picked.map((choice) => choice.tier ?? 0));
  const pkg = packagesData[tier];
  const care = picked.some((choice) => choice.id === 'care');
  // When one answer moves the build up a package, the price covers more than
  // that one thing: list the rest of what the package includes, so the jump
  // reads as a bundle rather than the cost of a single feature.
  const covered = new Set(picked.map((choice) => choice.covers));
  const alsoIncluded = tier > 0 ? pkg.items.filter((item) => !covered.has(item)) : [];
  const total = useTicker(pkg.from);

  const today = new Date()
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();

  const book = () => {
    const lines = picked.map((choice) => choice.label).join(', ');
    track('Ask about this build', { package: pkg.id });
    openBooking(pkg.id, `From the quote builder: ${pkg.name} (${priceRange(pkg)}). ${lines}.`);
  };

  return (
    <section className='qb' aria-labelledby='qb-title'>
      <SectionBar label='Build your quote' className='qb-bar'>
        <span>{QUESTIONS.length} questions</span>
      </SectionBar>

      <div className='qb-layout'>
        <div className='qb-questions'>
          <Reveal as="h2" className='qb-title' id='qb-title'>
            <span>Not sure</span> <span>which fits?</span>
          </Reveal>
          <Reveal as="p" className='qb-sub' delay={60}>
            Tell me what you need and the receipt works out which package it is.
          </Reveal>

          {QUESTIONS.map((question, q) => (
            <Reveal as="fieldset" key={question.id} className='qb-group' delay={100 + q * 50}>
              <legend>{question.title}</legend>
              <div className='qb-choices'>
                {question.choices.map((choice) => {
                  const on = answers[question.id].includes(choice.id);
                  return (
                    <button
                      key={choice.id}
                      type='button'
                      className={`qb-choice${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggle(question, choice)}
                    >
                      <i aria-hidden />
                      {choice.label}
                    </button>
                  );
                })}
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal as="div" className='qb-receipt-wrap' delay={120}>
          <div className='qb-receipt' ref={receiptRef} aria-live='polite'>
            <div className='qb-receipt-head'>
              <span className='qb-brand'>gios.build</span>
              <span>Estimate · {today}</span>
            </div>

            <ul className='qb-lines'>
              {picked.map((choice) => (
                <li key={choice.id} className='qb-line'>
                  <span>{choice.label}</span>
                  <span className='qb-leader' aria-hidden />
                  <span className='qb-tag'>{choice.tier === undefined ? 'Monthly' : TIER_TAGS[choice.tier]}</span>
                </li>
              ))}
            </ul>

            <div className='qb-package'>
              <span className='qb-package-label'>Your package</span>
              <span className='qb-package-name'>{pkg.name}</span>
              <span className='qb-package-time'>{pkg.timeline}</span>
              {alsoIncluded.length > 0 && (
                <ul className='qb-also' key={pkg.id}>
                  <li className='qb-also-label'>{pkg.name} also includes</li>
                  {alsoIncluded.map((item, k) => (
                    <li key={item} className='qb-also-item' style={{ '--k': k } as CSSProperties}>
                      <span>+ {item}</span>
                      <span className='qb-leader' aria-hidden />
                      <span className='qb-tag'>Included</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='qb-total'>
              <span className='qb-total-label'>From</span>
              <span className='qb-total-amount'>
                <span className='price-sign'>£</span>
                {total.toLocaleString('en-GB')}
                {!pkg.to && <span className='price-plus'>+</span>}
              </span>
            </div>
            <p className='qb-range'>
              {pkg.to ? `Usually ${priceRange(pkg)}` : `Starts at ${formatPrice(pkg.from)}`}
              {care && ', plus a monthly care plan'}
            </p>

            <button type='button' className='hero-action-button qb-book' onClick={book}>
              <p>Ask about this build</p>
              <GoArrowUpRight />
            </button>
            <p className='qb-fine'>A quick discovery call within 24 hours, then your free homepage mockup.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
