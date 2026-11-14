import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { GoArrowRight } from 'react-icons/go';
import { Link } from 'react-router-dom';
import { AUDIT_CONSENT, AUDIT_PATH, AUDIT_TURNAROUND, TURNSTILE_SITE_KEY } from '../data/audit';
import { track } from '../lib/analytics';
import './component-styles/auditForm.css';

// Cloudflare Turnstile, loaded only on the page with the form, and only once
interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}
// Turnstile only works on the hostnames its widget allows (gios.build), so
// on a local run the check is off; the dev server's stand-in doesn't ask for it
const TURNSTILE_ON =
  !!TURNSTILE_SITE_KEY && typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname);

let turnstileScript: Promise<TurnstileApi> | null = null;
const loadTurnstile = () =>
  (turnstileScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('turnstile')));
    script.onerror = () => reject(new Error('turnstile'));
    document.head.appendChild(script);
  }));

/** The "I'm human" check: invisible unless Cloudflare wants a click. */
function useTurnstile(onToken: (token: string | null) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  useEffect(() => {
    if (!TURNSTILE_ON || !ref.current) return;
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !ref.current) return;
        widget.current = turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
          // the light form's colours, whatever the visitor's system is set to
          theme: 'light',
          callback: (token: string) => onToken(token),
          'expired-callback': () => onToken(null),
          'error-callback': () => onToken(null),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (widget.current) window.turnstile?.remove(widget.current);
    };
  }, [onToken]);
  const reset = () => widget.current && window.turnstile?.reset(widget.current);
  return { ref, reset };
}

// the burst's dots, in the hero stickers' colours
const BURST = ['#fe432a', '#0a7cff', '#22c55e', '#f7e07a', '#c9b8f5', '#7cc4e4', '#fe432a', '#22c55e'];

/**
 * The free audit's request form: website, email, phone, an optional line on
 * what they want more of, and the consent tick. Sends to /api/audit
 * (worker/audit.ts), then thanks them and says when the report arrives.
 */
export function AuditForm() {
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wantsMoreOf, setWantsMoreOf] = useState('');
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const turnstile = useTurnstile(setToken);
  // the form's height as it's sent, so the thank-you card can shrink from it
  const formRef = useRef<HTMLFormElement>(null);
  const sentRef = useRef<HTMLDivElement>(null);
  const fromHeight = useRef(0);

  // Sent: the card eases from the form's height to its own, and comes into
  // view if the form was scrolled partly off screen (on a phone, say)
  useLayoutEffect(() => {
    const card = sentRef.current;
    if (!sentTo || !card) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && fromHeight.current) {
      card.animate([{ height: `${fromHeight.current}px` }, { height: `${card.offsetHeight}px` }], {
        duration: 520,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      });
    }
    const box = card.getBoundingClientRect();
    if (box.top < 80 || box.bottom > window.innerHeight) {
      card.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }
  }, [sentTo]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setError(null);
    if (TURNSTILE_ON && !token) {
      setError('One moment: the “I’m human” check is still loading.');
      return;
    }
    setSending(true);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website,
          email,
          phone,
          wants_more_of: wantsMoreOf,
          consent,
          company,
          turnstile: token,
          source_page: AUDIT_PATH,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
      track('Audit requested');
      fromHeight.current = formRef.current?.offsetHeight ?? 0;
      setSentTo(email.trim());
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Something went wrong. Please try again.');
      turnstile.reset();
      setToken(null);
    } finally {
      setSending(false);
    }
  };

  if (sentTo) {
    return (
      <div className='audit-form is-sent' role='status' ref={sentRef}>
        {/* the tick pops in and draws itself, with a burst of the stickers'
            colours around it (auditForm.css) */}
        <span className='audit-sent-mark' aria-hidden>
          {BURST.map((colour, index) => (
            <i key={index} style={{ '--a': `${index * (360 / BURST.length)}deg`, '--c': colour } as CSSProperties} />
          ))}
          <span className='audit-sent-tick'>
            <svg viewBox='0 0 24 24'><path d='M6.5 12.5l3.6 3.6 7.4-8' pathLength={1} fill='none' stroke='currentColor' strokeWidth='2.8' strokeLinecap='round' strokeLinejoin='round' /></svg>
          </span>
        </span>
        <h3>Your audit is on its way.</h3>
        <p>
          It’ll arrive at <strong>{sentTo}</strong> {AUDIT_TURNAROUND}. In the meantime, have a look at the{' '}
          <Link to='/work'>recent work</Link>.
        </p>
      </div>
    );
  }

  return (
    <form className='audit-form' onSubmit={submit} noValidate ref={formRef}>
      <div className='form-group'>
        <label htmlFor='audit-website'>
          Your website<span className='required-asterisk'>*</span>
        </label>
        <input
          id='audit-website'
          type='text'
          inputMode='url'
          autoComplete='url'
          placeholder='yourbusiness.co.uk'
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />
      </div>
      <div className='audit-form-row'>
        <div className='form-group'>
          <label htmlFor='audit-email'>
            Email<span className='required-asterisk'>*</span>
          </label>
          <input
            id='audit-email'
            type='email'
            autoComplete='email'
            placeholder='you@yourbusiness.co.uk'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className='form-group'>
          <label htmlFor='audit-phone'>
            Phone<span className='required-asterisk'>*</span>
          </label>
          <input
            id='audit-phone'
            type='tel'
            autoComplete='tel'
            placeholder='07123 456789'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>
      <div className='form-group'>
        <label htmlFor='audit-more'>
          What do you want more of? <span className='audit-optional'>Optional</span>
        </label>
        <input
          id='audit-more'
          type='text'
          placeholder='e.g. bookings, quote requests, people through the door'
          value={wantsMoreOf}
          onChange={(e) => setWantsMoreOf(e.target.value)}
        />
      </div>

      {/* bots fill in every field; people never see this one */}
      <div className='audit-trap' aria-hidden>
        <label htmlFor='audit-company'>Company</label>
        <input id='audit-company' tabIndex={-1} autoComplete='off' value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <label className='audit-consent'>
        <input type='checkbox' checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          {AUDIT_CONSENT} See the <Link to='/privacy'>privacy page</Link>.
        </span>
      </label>

      <div className='audit-turnstile' ref={turnstile.ref} />

      {error && <p className='booking-error' role='alert'>{error}</p>}

      <button type='submit' className='hero-action-button audit-submit' disabled={sending}>
        <p>{sending ? 'Sending…' : 'Get my free audit'}</p>
        {!sending && <GoArrowRight aria-hidden />}
      </button>
    </form>
  );
}
