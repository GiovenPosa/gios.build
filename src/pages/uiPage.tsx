import { useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { GoArrowRight, GoCheck, GoCopy } from 'react-icons/go';
// the real Gio UI themes, installed with `npx shadcn add @giosbuild/theme-saas @giosbuild/theme-bold`
import '../components/ui/theme-saas.css';
import '../components/ui/theme-bold.css';
// this page's extras for them, and its own default and gios themes
import '../components/uiKit/themes.css';
import './page-styles/uiPage.css';
import { PageMeta } from '../components/pageMeta';
import { Reveal } from '../components/reveal';
import { HeroOrb } from '../components/heroOrb';
import { FaqThread } from '../components/faqThread';
import { Button } from '../components/ui/button';
import { Field, TextInput } from '../components/ui/field';
import { ComponentPreview, DemoForm, HowItWorks, MiniForm } from '../components/uiDemos';
import { INSTALL_COMMAND, REGISTRY_LINE, UI_COMPONENTS, UI_FAQ, UI_ORIGINS, UI_THEMES, type ThemeId } from '../data/uiKit';
import { EMAIL_PATTERN } from '../data/enquiry';
import { track } from '../lib/analytics';

// gios.build/ui: the landing page for Gio UI, the component library, written
// for developers. A live, themeable form in the hero, how copy-in works, the
// components working live, one form in three themes, where they come from, a
// waitlist and a developer FAQ. Nothing is sold yet; the page collects a
// waitlist (worker/waitlist.ts).

const SIGN_OFF = ['That’s what developers usually ask 🙌', 'Anything else? Message me below and I’ll get back to you.'];

/** Scrolls to the waitlist and puts the cursor in its email field */
function goToWaitlist() {
  const input = document.getElementById('waitlist-email');
  input?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  input?.focus({ preventScroll: true });
}

export function UiPage() {
  const [theme, setTheme] = useState<ThemeId>('saas');

  const pickTheme = (next: ThemeId) => {
    if (next === theme) return;
    setTheme(next);
    track('Switch UI theme', { theme: next });
  };

  return (
    <>
      <PageMeta path='/ui' />

      <div className='ui-page'>
        <div className='ui-page-container'>
          {/* 1. The hero: the demo is the explanation */}
          <section className='ui-hero'>
            <div className='ui-hero-copy'>
              <Reveal as='h1' className='ui-hero-title'>
                <span>Copy it in.</span> <span>Make it yours.</span>
              </Reveal>
              <Reveal as='p' className='ui-hero-sub' delay={80}>
                Gio UI is a React component library you copy into your project. Theme it with CSS variables, change anything,
                and hand it to your client as plain code.
              </Reveal>
              <Reveal delay={140}>
                <InstallCommand />
              </Reveal>
              <Reveal as='div' className='ui-hero-actions' delay={200}>
                <button type='button' className='hero-action-button' onClick={goToWaitlist}>
                  <p>Join the waitlist</p>
                  <GoArrowRight aria-hidden />
                </button>
                <a href='#components' className='hero-action-button secondary'>
                  <p>Browse components</p>
                </a>
              </Reveal>
            </div>

            <Reveal className='ui-hero-demo' delay={120}>
              <HeroOrb play delay={400} />
              <ThemePills value={theme} onChange={pickTheme} />
              <DemoForm theme={theme} />
            </Reveal>
          </section>

          {/* 2. How it works, on the page's one dark band */}
          <section className='ui-band' data-header-dark aria-labelledby='ui-how-title'>
            <Reveal as='h2' className='ui-band-title' id='ui-how-title'>
              <span>Pull. Theme.</span> <span>Own it.</span>
            </Reveal>
            <Reveal as='p' className='ui-band-sub' delay={60}>
              No package to keep up with and nothing tying a site back to me. Once a component is in your project, it’s your
              code, and your client’s at handover.
            </Reveal>
            <HowItWorks />
          </section>

          {/* 3. The components, each one working */}
          <section className='ui-section' id='components' aria-labelledby='ui-components-title'>
            <Reveal as='h2' className='ui-section-title' id='ui-components-title'>
              <span>Every one</span> <span>works.</span>
            </Reveal>
            <Reveal as='p' className='ui-section-sub' delay={60}>
              Try them. They follow the theme you picked up top, currently {UI_THEMES.find((t) => t.id === theme)?.label}.
            </Reveal>
            <div className='ui-grid'>
              {UI_COMPONENTS.map((item, i) => (
                <Reveal as='article' key={item.id} className='ui-card' delay={(i % 2) * 80}>
                  <div className='ui-card-preview' data-ui-theme={theme}>
                    <div className='ui-card-stage'>
                      <ComponentPreview id={item.id} />
                    </div>
                  </div>
                  <div className='ui-card-info'>
                    <h3 className='ui-card-name'>{item.name}</h3>
                    {item.soon ? (
                      <span className='ui-tier is-soon'>Coming soon</span>
                    ) : (
                      <span className={`ui-tier is-${item.tier.toLowerCase()}`}>{item.tier}</span>
                    )}
                  </div>
                  <p className='ui-card-blurb'>{item.blurb}</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 4. One form in both themes */}
          <section className='ui-section' aria-labelledby='ui-themes-title'>
            <Reveal as='h2' className='ui-section-title' id='ui-themes-title'>
              <span>One form.</span> <span>Two looks.</span>
            </Reveal>
            <Reveal as='p' className='ui-section-sub' delay={60}>
              The same components, the same code. Only the theme file changes.
            </Reveal>
            <div className='ui-pair'>
              {UI_THEMES.map(({ id }, i) => (
                <Reveal key={id} className='ui-pair-item' delay={i * 80}>
                  <div className='ui-demo-card' data-ui-theme={id}>
                    <MiniForm theme={id} />
                  </div>
                  <p className='ui-pair-label'>theme-{id}.css</p>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 5. Where they come from (only sites they really run on) */}
          <section className='ui-section' aria-labelledby='ui-origins-title'>
            <Reveal as='h2' className='ui-section-title' id='ui-origins-title'>
              <span>Proven on</span> <span>live sites first.</span>
            </Reveal>
            <Reveal as='p' className='ui-section-sub' delay={60}>
              Every component starts life on a real site before it joins the library.
            </Reveal>
            <div className='ui-origins'>
              {UI_ORIGINS.map((origin, i) => (
                <Reveal as='article' key={origin.site} className='ui-origin' delay={i * 80}>
                  <p className='ui-origin-kind'>{origin.kind}</p>
                  <h3 className='ui-origin-site'>{origin.site}</h3>
                  <ul className='ui-origin-list' aria-label={`Components from ${origin.site}`}>
                    {origin.components.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 6. The waitlist (pricing cards take its place at launch) */}
          <Waitlist />

          {/* 7. Developer questions, in the site's message thread */}
          <section className='home-faq-block ui-faq'>
            <Reveal as='h2' className='home-faq-headline'>
              <span>Questions?</span> <span>Just ask.</span>
            </Reveal>
            <Reveal as='p' className='home-faq-subtext' delay={60}>
              What developers usually want to know first.
            </Reveal>
            <FaqThread
              items={UI_FAQ}
              signOff={SIGN_OFF}
              composerLabel='Email me a question…'
              onCompose={() => {
                window.location.href = 'mailto:contact@gios.build?subject=Gio%20UI';
              }}
            />
          </section>
        </div>
      </div>
    </>
  );
}

/* ---------------- Pieces ---------------- */

function ThemePills({ value, onChange }: { value: ThemeId; onChange: (theme: ThemeId) => void }) {
  return (
    <div className='ui-pills' role='group' aria-label='Theme'>
      {UI_THEMES.map((t) => (
        <button
          key={t.id}
          type='button'
          className={`ui-pill${value === t.id ? ' is-on' : ''}`}
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function InstallCommand() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      return; // clipboard blocked: the command is still there to select
    }
    track('Copy install command');
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className='ui-install'>
      <div className='ui-command'>
        <code>
          <span className='ui-command-prompt' aria-hidden>$</span> {INSTALL_COMMAND}
        </code>
        <button type='button' className={`ui-copy${copied ? ' is-copied' : ''}`} onClick={copy} aria-label={copied ? 'Copied' : 'Copy the install command'}>
          {copied ? <GoCheck aria-hidden /> : <GoCopy aria-hidden />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <p className='ui-install-note'>
        First add <code>{REGISTRY_LINE}</code> to the <code>registries</code> in your <code>components.json</code>.
      </p>
    </div>
  );
}

type WaitState = 'idle' | 'sending' | 'joined' | 'error';

function Waitlist() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<WaitState>('idle');
  const [error, setError] = useState<string>();
  // the hidden "website" field: people never see it, bots fill it in
  const [website, setWebsite] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Please enter a valid email.');
      return;
    }
    setError(undefined);
    setState('sending');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), website, source_page: '/ui' }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? 'Something went wrong. Please try again.');
      track('Join UI waitlist');
      setState('joined');
    } catch (e) {
      setError(e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'Something went wrong. Please try again.');
      setState('error');
    }
  };

  return (
    <Reveal as='section' className='ui-waitlist' aria-labelledby='ui-waitlist-title'>
      <div className='ui-waitlist-copy'>
        <h2 id='ui-waitlist-title' className='ui-waitlist-title'>
          <span>Be first in.</span>
        </h2>
        <p className='ui-waitlist-sub'>
          One email when Gio UI launches, with the launch price. No newsletter, nothing else.{' '}
          <Link to='/privacy'>How your email is kept</Link>
        </p>
      </div>

      {/* the site's own look for its own form (themes.css), not a library theme */}
      <div className='ui-waitlist-form-slot' data-ui-theme='gios'>
        {state === 'joined' ? (
          <p className='ui-waitlist-done' role='status'>
            You’re on the list. I’ll email {email.trim()} when it launches.
          </p>
        ) : (
          <form className='ui-waitlist-form' onSubmit={submit} noValidate>
            <Field label='Email' htmlFor='waitlist-email' error={error} errorId='waitlist-error' className='ui-waitlist-field'>
              <TextInput
                id='waitlist-email'
                type='email'
                autoComplete='email'
                placeholder='you@studio.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error || undefined}
                aria-describedby={error ? 'waitlist-error' : undefined}
              />
            </Field>
            <input
              className='ui-honeypot'
              type='text'
              name='website'
              tabIndex={-1}
              autoComplete='off'
              aria-hidden
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <Button type='submit' className='ui-waitlist-submit' disabled={state === 'sending'}>
              {state === 'sending' ? 'Joining…' : 'Join the waitlist'}
            </Button>
          </form>
        )}
      </div>
    </Reveal>
  );
}
