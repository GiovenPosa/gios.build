import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
// page stand-ins for what the library doesn't have yet (shown as "Coming soon")
import { Accordion, Chips, SecondaryButton } from './uiKit/uiKit';
// the library's own, installed from ui.gios.build with `npx shadcn add @giosbuild/...`
import { Button } from './ui/button';
import { CookieBanner, type CookieChoice } from './ui/cookie-banner';
import { Dropdown } from './ui/dropdown';
import { Field, TextArea, TextInput } from './ui/field';
import { Popover } from './ui/popover';
import { Reveal } from './reveal';
import { useInViewOnce } from '../hooks/useInViewOnce';
import type { ThemeId } from '../data/uiKit';

// The /ui page's live demos. Field, TextInput, TextArea, Dropdown, Popover,
// Button and CookieBanner are the library's own (components/ui/); Chips and
// Accordion are page stand-ins until the library has them (uiKit/). Each demo
// sits inside an element carrying data-ui-theme, so switching the theme
// reskins it without touching the components.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const PROJECTS = [
  { value: 'new', label: 'A new website' },
  { value: 'redesign', label: 'A redesign' },
  { value: 'booking', label: 'A booking system' },
  { value: 'other', label: 'Something else' },
];

const TIMELINES = [
  { value: 'now', label: 'This month' },
  { value: 'soon', label: 'In 3 months' },
  { value: 'later', label: 'Just looking' },
];

/* ---------------- The hero's form ---------------- */

/** A small, real form: it validates, and "sends" without anything leaving the page. */
export function DemoForm({ theme }: { theme: ThemeId }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<string | null>('soon');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [sent, setSent] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next = {
      name: name.trim() ? undefined : 'Please enter your name.',
      email: EMAIL.test(email.trim()) ? undefined : 'Please enter a valid email.',
    };
    setErrors(next);
    if (!next.name && !next.email) setSent(true);
  };

  const reset = () => {
    setName('');
    setEmail('');
    setProject(null);
    setTimeline('soon');
    setErrors({});
    setSent(false);
  };

  return (
    <div className='ui-demo-card' data-ui-theme={theme}>
      {sent ? (
        <div className='ui-demo-sent' role='status'>
          <p className='ui-demo-title'>Request sent</p>
          <p className='ui-demo-note'>It’s a demo, so nothing left this page. Try another theme above.</p>
          <SecondaryButton onClick={reset}>Start again</SecondaryButton>
        </div>
      ) : (
        <form className='ui-demo-form' onSubmit={submit} noValidate>
          <div>
            <p className='ui-demo-title'>Start a project</p>
            <p className='ui-demo-note'>The fields, dropdown and button are Gio UI components.</p>
          </div>
          <div className='ui-demo-row'>
            <Field label='Name' htmlFor='demo-name' error={errors.name} errorId='demo-name-error'>
              <TextInput
                id='demo-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Alex Smith'
                autoComplete='off'
                aria-invalid={!!errors.name || undefined}
                aria-describedby={errors.name ? 'demo-name-error' : undefined}
              />
            </Field>
            <Field label='Email' htmlFor='demo-email' error={errors.email} errorId='demo-email-error'>
              <TextInput
                id='demo-email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='alex@studio.com'
                autoComplete='off'
                aria-invalid={!!errors.email || undefined}
                aria-describedby={errors.email ? 'demo-email-error' : undefined}
              />
            </Field>
          </div>
          <Field label='What are you building?' htmlFor='demo-project' optional>
            <Dropdown id='demo-project' value={project} options={PROJECTS} onChange={setProject} placeholder='Choose one' />
          </Field>
          <Field label='When' labelId='demo-when'>
            <Chips name='demo-when' value={timeline} options={TIMELINES} onChange={setTimeline} labelledBy='demo-when' />
          </Field>
          <Button type='submit' fullWidth className='ui-demo-submit'>Send request</Button>
        </form>
      )}
    </div>
  );
}

/* ---------------- The component grid's previews ---------------- */

function TextInputPreview() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  return (
    <Field label='Email' htmlFor='grid-email' error={error} errorId='grid-email-error'>
      <TextInput
        id='grid-email'
        type='email'
        value={value}
        placeholder='Type, then click away'
        onChange={(e) => {
          setValue(e.target.value);
          if (error && EMAIL.test(e.target.value)) setError(undefined);
        }}
        onBlur={() => setError(value && !EMAIL.test(value) ? 'That doesn’t look like an email.' : undefined)}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? 'grid-email-error' : undefined}
      />
    </Field>
  );
}

function DropdownPreview() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field label='Package' htmlFor='grid-package'>
      <Dropdown
        id='grid-package'
        value={value}
        onChange={setValue}
        placeholder='Choose a package'
        options={[
          { value: 'starter', label: 'Starter' },
          { value: 'growth', label: 'Growth' },
          { value: 'custom', label: 'Custom' },
        ]}
      />
    </Field>
  );
}

function ButtonPreview() {
  const [sent, setSent] = useState(false);
  return (
    <div className='ui-preview-center'>
      <Button onClick={() => setSent((s) => !s)} aria-pressed={sent}>
        {sent ? 'Done ✓' : 'Get started'}
      </Button>
    </div>
  );
}

function ChipsPreview() {
  const [value, setValue] = useState<string | null>('monthly');
  return (
    <Field label='Billing' labelId='grid-billing'>
      <Chips
        name='grid-billing'
        value={value}
        onChange={setValue}
        labelledBy='grid-billing'
        options={[
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' },
        ]}
      />
    </Field>
  );
}

function TextAreaPreview() {
  return (
    <Field label='Message' htmlFor='grid-message' optional>
      <TextArea id='grid-message' rows={3} placeholder='Tell me about the project…' />
    </Field>
  );
}

function PopoverPreview() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const items = ['Copy link', 'Email', 'Embed'];
  return (
    <div className='ui-preview-center'>
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        className='ui-popover-demo'
        panelClassName='ui-popover-panel'
        trigger={
          <SecondaryButton aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {picked ?? 'Share'}
          </SecondaryButton>
        }
      >
        <ul className='gui-listbox'>
          {items.map((item) => (
            <li key={item}>
              <button
                type='button'
                className='gui-option ui-popover-item'
                onClick={() => {
                  setPicked(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}

function CookiePreview() {
  // persist={false}: the demo shows every time and remembers nothing
  const [answer, setAnswer] = useState<CookieChoice | null>(null);
  const [round, setRound] = useState(0);
  return (
    <div className='ui-preview-center'>
      {answer ? (
        <div className='ui-cookie-done'>
          <span>You chose “{answer === 'accepted' ? 'Accept' : 'Deny'}”.</span>
          <button
            type='button'
            className='ui-text-button'
            onClick={() => {
              setAnswer(null);
              setRound((r) => r + 1);
            }}
          >
            Show it again
          </button>
        </div>
      ) : (
        <CookieBanner key={round} inline persist={false} delay={0} moreHref='/privacy' moreLabel='Privacy policy' onChoice={setAnswer} />
      )}
    </div>
  );
}

function RevealPreview() {
  const [round, setRound] = useState(0);
  return (
    <div className='ui-reveal-demo'>
      <div key={round} className='ui-reveal-rows'>
        {[0, 1, 2].map((i) => (
          <Reveal key={i} className='ui-reveal-row' delay={i * 90} threshold={0}>
            <span />
            <span />
          </Reveal>
        ))}
      </div>
      <button type='button' className='ui-text-button' onClick={() => setRound((r) => r + 1)}>
        Replay
      </button>
    </div>
  );
}

function SmartHeaderPreview() {
  const [hidden, setHidden] = useState(false);
  const last = useRef(0);
  return (
    <div
      className='ui-smart-header'
      tabIndex={0}
      aria-label='Scroll inside this box to see the header hide and come back'
      onScroll={(e) => {
        const y = e.currentTarget.scrollTop;
        setHidden(y > last.current && y > 24);
        last.current = y;
      }}
    >
      <div className={`ui-smart-bar${hidden ? ' is-hidden' : ''}`}>
        <span className='ui-smart-logo' />
        <span className='ui-smart-links'>
          <i />
          <i />
        </span>
      </div>
      <div className='ui-smart-page'>
        <p>Scroll down in here</p>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className='ui-smart-line' />
        ))}
        <p>…then back up</p>
      </div>
    </div>
  );
}

const PREVIEWS: Record<string, () => ReactNode> = {
  'text-input': () => <TextInputPreview />,
  dropdown: () => <DropdownPreview />,
  button: () => <ButtonPreview />,
  chips: () => <ChipsPreview />,
  accordion: () => (
    <Accordion
      name='grid-faq'
      items={[
        { title: 'Do I need Tailwind?', body: 'No. CSS Modules and CSS variables.' },
        { title: 'Who owns the code?', body: 'You do, and so does your client.' },
      ]}
    />
  ),
  'text-area': () => <TextAreaPreview />,
  popover: () => <PopoverPreview />,
  'cookie-banner': () => <CookiePreview />,
  reveal: () => <RevealPreview />,
  'smart-header': () => <SmartHeaderPreview />,
};

export function ComponentPreview({ id }: { id: string }) {
  return <>{PREVIEWS[id]?.()}</>;
}

/* ---------------- The same form in three themes ---------------- */

export function MiniForm({ theme }: { theme: ThemeId }) {
  const [plan, setPlan] = useState<string | null>('pro');
  return (
    <form className='ui-mini-form' onSubmit={(e) => e.preventDefault()}>
      <Field label='Work email' htmlFor={`mini-${theme}`}>
        <TextInput id={`mini-${theme}`} type='email' placeholder='you@company.com' autoComplete='off' />
      </Field>
      <Field label='Plan' labelId={`mini-plan-${theme}`}>
        <Chips
          name={`mini-plan-${theme}`}
          value={plan}
          onChange={setPlan}
          labelledBy={`mini-plan-${theme}`}
          options={[
            { value: 'starter', label: 'Starter' },
            { value: 'pro', label: 'Pro' },
          ]}
        />
      </Field>
      <Button type='submit' fullWidth>Get started</Button>
    </form>
  );
}

/* ---------------- How it works: three steps that play in view ---------------- */

/** Types `text` out once `start` is true; all at once with reduced motion. */
function useTyped(text: string, start: boolean, speed = 38) {
  const [count, setCount] = useState(0);
  const instant = reducedMotion();
  useEffect(() => {
    if (!start || instant) return;
    const timer = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(timer);
          return c;
        }
        return c + 1;
      });
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, start, speed, instant]);
  const shown = start && instant ? text.length : count;
  return { typed: text.slice(0, shown), done: shown >= text.length };
}

/** true `ms` after `when` turns true (straight away with reduced motion) */
function useAfter(when: boolean, ms: number) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!when) return;
    const timer = window.setTimeout(() => setReady(true), reducedMotion() ? 0 : ms);
    return () => window.clearTimeout(timer);
  }, [when, ms]);
  return ready;
}

// what `add @giosbuild/dropdown` really installs (it brings field and popover)
const PULLED = [
  'components/ui/field.tsx',
  'components/ui/field.module.css',
  'components/ui/popover.tsx',
  'components/ui/popover.module.css',
  'components/ui/dropdown.tsx',
  'components/ui/dropdown.module.css',
];
const COMMAND = 'npx shadcn add @giosbuild/dropdown';

function PullScreen({ play }: { play: boolean }) {
  const { typed, done } = useTyped(COMMAND, play);
  return (
    <div className='ui-term-body'>
      <p className='ui-term-line'>
        <span className='ui-term-prompt'>$</span> {typed}
        {!done && <span className='ui-term-caret' />}
      </p>
      <ul className='ui-term-files'>
        {PULLED.map((file, i) => (
          <li key={file} className={done ? 'is-in' : undefined} style={{ '--i': i } as CSSProperties}>
            <span className='ui-term-ok'>+</span> {file}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThemeScreen({ play }: { play: boolean }) {
  // the accent and the corners change over, and the preview follows
  const changed = useAfter(play, 900);
  const accent = changed ? '#fe432a' : '#5b5bd6';
  const radius = changed ? '18px' : '6px';
  return (
    <div className='ui-term-body'>
      <p className='ui-term-comment'>/* styles/theme.css */</p>
      <p className='ui-term-line'>
        <span className='ui-term-key'>--ui-accent</span>: <span className={`ui-term-value${changed ? ' is-changed' : ''}`} key={accent}>{accent}</span>;
      </p>
      <p className='ui-term-line'>
        <span className='ui-term-key'>--ui-radius</span>: <span className={`ui-term-value${changed ? ' is-changed' : ''}`} key={radius}>{radius}</span>;
      </p>
      <div className='ui-term-preview' style={{ '--accent': accent, '--r': radius } as CSSProperties} aria-hidden>
        <span className='ui-term-chip'>Monthly</span>
        <span className='ui-term-button'>Get started</span>
      </div>
    </div>
  );
}

const OWNED = ['No package to install', 'No key needed to build', 'Plain code at handover'];

function OwnScreen({ play }: { play: boolean }) {
  const ready = useAfter(play, 500);
  return (
    <div className='ui-term-body'>
      <p className='ui-term-comment'>// @giosbuild/dropdown 0.1.0</p>
      <p className='ui-term-line'>
        <span className='ui-term-key'>export function</span> Dropdown(…) {'{'}
      </p>
      <p className='ui-term-line ui-term-edit'>
        {'  '}<span className='ui-term-comment'>// yours now: change anything</span>
      </p>
      <p className='ui-term-line'>{'}'}</p>
      <ul className='ui-term-files'>
        {OWNED.map((line, i) => (
          <li key={line} className={ready ? 'is-in' : undefined} style={{ '--i': i } as CSSProperties}>
            <span className='ui-term-ok'>✓</span> {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = [
  { title: 'Pull', text: 'One command copies the files into your project, with anything they depend on.', Screen: PullScreen },
  { title: 'Theme', text: 'Colours, fonts and corners live in one theme file. A rebrand touches nothing else.', Screen: ThemeScreen },
  { title: 'Own it', text: 'The code is yours from then on. Edit it freely, and hand it to your client as plain files.', Screen: OwnScreen },
];

function Step({ index }: { index: number }) {
  const { ref, isVisible } = useInViewOnce<HTMLLIElement>(0.4);
  const { title, text, Screen } = STEPS[index];
  return (
    <li ref={ref} className='ui-step'>
      <div className='ui-term' aria-hidden>
        <div className='ui-term-bar'>
          <i />
          <i />
          <i />
        </div>
        <Screen play={isVisible} />
      </div>
      <p className='ui-step-number'>0{index + 1}</p>
      <h3 className='ui-step-title'>{title}</h3>
      <p className='ui-step-text'>{text}</p>
    </li>
  );
}

export function HowItWorks() {
  return (
    <ol className='ui-steps'>
      {STEPS.map((step, i) => (
        <Step key={step.title} index={i} />
      ))}
    </ol>
  );
}
