"use client";
// @giosbuild/cookie-banner 0.3.0

import { useEffect, useState, type ReactNode } from "react";
import styles from "./cookie-banner.module.css";

/*
 * The cookie notice, after Prime Stock Central's: a small pill floating at
 * the bottom of the screen, "We use cookies. Read more" with Accept and Deny.
 * It slides up a moment after the page loads, and once answered it's gone for
 * good: the choice is kept in this browser (localStorage).
 *
 * Only switch on optional cookies (analytics and the like) once
 * getCookieChoice() is "accepted".
 */

export type CookieChoice = "accepted" | "denied";

const DEFAULT_KEY = "cookie-choice";

// joined with a template literal, not join(" "): the shadcn CLI rewrites plain
// string literals in some setups (tailwind.cssVariables: false), and " " would
// come out as ""
const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).reduce<string>((all, name) => (all ? `${all} ${name}` : (name as string)), "");

/** The visitor's answer in this browser, or null if they haven't answered yet. */
export function getCookieChoice(storageKey: string = DEFAULT_KEY): CookieChoice | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "accepted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export interface CookieBannerProps {
  /** the words before the link */
  message?: ReactNode;
  /** where "Read more" goes, e.g. your cookie or privacy page; no link if left out */
  moreHref?: string;
  moreLabel?: string;
  /** called with the visitor's answer */
  onChoice?: (choice: CookieChoice) => void;
  /** how long after the page loads it slides up, in ms */
  delay?: number;
  /** where the answer is remembered */
  storageKey?: string;
  /** false: show it every time and remember nothing (for demos) */
  persist?: boolean;
  /** sits in the page where it's placed, instead of floating over it */
  inline?: boolean;
  className?: string;
}

type State = "hidden" | "shown" | "leaving";

export function CookieBanner({
  message = "We use cookies.",
  moreHref,
  moreLabel = "Read more",
  onChoice,
  delay = 1200,
  storageKey = DEFAULT_KEY,
  persist = true,
  inline = false,
  className,
}: CookieBannerProps) {
  const [state, setState] = useState<State>("hidden");

  useEffect(() => {
    if (persist && getCookieChoice(storageKey)) return;
    const timer = setTimeout(() => setState("shown"), delay);
    return () => clearTimeout(timer);
  }, [persist, storageKey, delay]);

  function answer(choice: CookieChoice) {
    if (persist) {
      try {
        localStorage.setItem(storageKey, choice);
      } catch {
        // storage blocked: it'll ask again next visit, nothing else to do
      }
    }
    onChoice?.(choice);
    setState("leaving");
  }

  if (state === "hidden") return null;

  return (
    <div
      className={cx(styles.notice, inline && styles.inline, className)}
      data-state={state}
      role="region"
      aria-label="Cookie notice"
      onAnimationEnd={() => state === "leaving" && setState("hidden")}
    >
      <p className={styles.text}>
        <span>{message}</span>
        {moreHref ? (
          <a href={moreHref} className={styles.more}>
            {moreLabel}
          </a>
        ) : null}
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.accept} onClick={() => answer("accepted")}>
          Accept
        </button>
        <button type="button" className={styles.deny} onClick={() => answer("denied")}>
          Deny
        </button>
      </div>
    </div>
  );
}
