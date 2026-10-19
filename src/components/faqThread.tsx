import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { faqData, type FaqItem } from '../data/faq';
import { useInViewOnce } from '../hooks/useInViewOnce';
import { useBooking } from '../context/bookingContext';
import { track } from '../lib/analytics';
import GioAvatar from '../assets/story/gio-avatar.webp';
import './component-styles/faqThread.css';

type Side = 'in' | 'out';
interface Message {
  id: number;
  side: Side;
  text: string;
  /** a question still in flight from its pill; drawn once it lands */
  flying?: boolean;
  /** when it was sent, for the read receipt */
  at: number;
}

// the visitor's local time, as iMessage shows it ("14:05")
const clock = (time: number) => new Date(time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const GREETING = ["Hey, I'm Gio 👋", 'Tap a question below and I’ll answer it.'];
const SIGN_OFF = ['That’s everything people usually ask 🙌', 'Anything else? Message me below and I’ll get back to you.'];

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// a beat to "read" the question, then typing time that grows with the reply
const typingTime = (text: string) => Math.min(1300, 500 + text.length * 5);

/**
 * The FAQ as a live iMessage thread, from the visitor's side: their questions
 * go out in blue on the right, Gio replies in grey on the left. It starts
 * empty: Gio says hello when it scrolls into view, and the questions wait
 * underneath as suggestion pills. Tapping one flies the pill up into the chat
 * where it becomes the sent bubble, then Gio types and answers. When every question has been asked he
 * signs off and points at the composer, which opens the booking form.
 */
export function FaqThread() {
  const { openBooking } = useBooking();
  const { ref: inViewRef, isVisible } = useInViewOnce<HTMLDivElement>(0.35);
  const windowRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(0);
  const flight = useRef<{ id: number; from: DOMRect } | null>(null);
  const timers = useRef<number[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  // the thread's opening stamp: when you arrived, then when Gio first spoke
  const [openedAt] = useState(() => Date.now());
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(true);
  const [asked, setAsked] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const push = useCallback((side: Side, text: string, flying = false) => {
    const id = nextId.current++;
    setMessages((list) => [...list, { id, side, text, flying, at: Date.now() }]);
    return id;
  }, []);

  /** Gio types for a moment, then sends each line in turn. */
  const reply = useCallback(
    (lines: string[], then?: () => void) => {
      const send = (index: number) => {
        const line = lines[index];
        if (line === undefined) {
          then?.();
          return;
        }
        if (reducedMotion()) {
          push('in', line);
          send(index + 1);
          return;
        }
        setTyping(true);
        later(() => {
          setTyping(false);
          push('in', line);
          later(() => send(index + 1), 380);
        }, typingTime(line));
      };
      send(0);
    },
    [later, push]
  );

  // Gio says hello once the thread is on screen
  useEffect(() => {
    if (!isVisible) return;
    later(() => reply(GREETING, () => setBusy(false)), 350);
  }, [isVisible, later, reply]);

  // keep the newest message in view, like a real chat
  useEffect(() => {
    const pane = windowRef.current;
    if (pane) pane.scrollTo({ top: pane.scrollHeight, behavior: reducedMotion() ? 'auto' : 'smooth' });
  }, [messages, typing]);

  // Fly the tapped pill to where its bubble now sits, then reveal the bubble.
  useLayoutEffect(() => {
    const pending = flight.current;
    const pane = windowRef.current;
    if (!pending || !pane) return;
    const bubble = pane.querySelector<HTMLElement>(`[data-message="${pending.id}"]`);
    if (!bubble) return;
    flight.current = null;
    pane.scrollTop = pane.scrollHeight;
    const to = bubble.getBoundingClientRect();
    const { from } = pending;
    const land = () => setMessages((list) => list.map((m) => (m.id === pending.id ? { ...m, flying: false } : m)));

    if (reducedMotion()) {
      land();
      return;
    }
    const ghost = document.createElement('div');
    ghost.className = 'faq-ghost';
    ghost.textContent = bubble.textContent;
    Object.assign(ghost.style, { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px` });
    document.body.appendChild(ghost);
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const animation = ghost.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0.6 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 620, easing: 'cubic-bezier(0.12, 1.1, 0.3, 1)' }
    );
    animation.onfinish = () => {
      ghost.remove();
      land();
    };
  }, [messages]);

  const ask = (item: FaqItem, pill: HTMLButtonElement) => {
    if (busy) return;
    setBusy(true);
    track('Ask FAQ', { question: item.question });
    const from = pill.getBoundingClientRect();
    const remaining = faqData.length - asked.length - 1;
    setAsked((list) => [...list, item.question]);
    const id = push('out', item.question, !reducedMotion());
    flight.current = { id, from };
    later(() => {
      reply([item.answer], () => {
        if (remaining > 0) setBusy(false);
        else later(() => reply(SIGN_OFF, () => setDone(true)), 700);
      });
    }, reducedMotion() ? 0 : 750);
  };

  const remaining = faqData.filter((item) => !asked.includes(item.question));
  // like iMessage, "Read" sits under the visitor's latest message
  const lastSent = [...messages].reverse().find((m) => m.side === 'out');

  return (
    <div className='faq-thread' ref={inViewRef}>
      <div className='faq-pane'>
      {/* pinned over the chat; the messages fade out as they slide under it */}
      <div className='faq-header'>
        <img className='faq-avatar' src={GioAvatar} alt='' width={120} height={120} draggable={false} />
        <span className='faq-name'>Gio</span>
      </div>
      <div className='faq-window' ref={windowRef}>
        <p className='faq-stamp'>Today {clock(messages[0]?.at ?? openedAt)}</p>

        <div className='faq-messages' aria-live='polite'>
          {messages.map((message, index) => {
            const next = messages[index + 1];
            const tail = !next || next.side !== message.side;
            return (
              <div key={message.id} className={`faq-row faq-row-${message.side}`}>
                <p
                  data-message={message.id}
                  className={`faq-bubble faq-${message.side}${tail ? ' has-tail' : ''}${message.flying ? ' is-flying' : ''}`}
                >
                  {message.text}
                </p>
                {message === lastSent && !message.flying && (
                  <span className='faq-receipt'>Read {clock(message.at)}</span>
                )}
              </div>
            );
          })}
          {typing && (
            <div className='faq-row faq-row-in'>
              <span className='faq-typing' aria-label='Gio is typing'><i /><i /><i /></span>
            </div>
          )}
        </div>
      </div>
      </div>

      <div className={`faq-suggestions${busy ? ' is-busy' : ''}`} aria-label='Questions you can ask'>
        {remaining.map((item) => (
          <button
            key={item.question}
            type='button'
            className='faq-pill'
            // marked unavailable rather than disabled while Gio replies, so
            // keyboard users can still reach the questions (ask() ignores it)
            aria-disabled={busy}
            onClick={(event) => ask(item, event.currentTarget)}
          >
            {item.question}
          </button>
        ))}
      </div>

      <button type='button' className={`faq-composer${done ? ' is-ready' : ''}`} onClick={() => openBooking()}>
        <span className='faq-composer-field'>Ask me anything…</span>
        <span className='faq-composer-send' aria-hidden>
          <svg viewBox='0 0 24 24' fill='none'><path d='M12 19V5m0 0-6 6m6-6 6 6' stroke='currentColor' strokeWidth='2.6' strokeLinecap='round' strokeLinejoin='round' /></svg>
        </span>
      </button>
    </div>
  );
}
