"use client";
// @giosbuild/popover 0.1.0

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import styles from "./popover.module.css";

/*
 * A panel that drops down from its trigger, or up when there isn't room
 * below. Closes on a click or tap outside, or on Escape.
 */

// joined with a template literal, not join(" "): the shadcn CLI rewrites plain
// string literals in some setups (tailwind.cssVariables: false), and " " would
// come out as ""
const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).reduce<string>((all, name) => (all ? `${all} ${name}` : (name as string)), "");

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}

export function Popover({ open, onClose, trigger, children, className, panelClassName }: PopoverProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!anchorRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // open upwards only when it doesn't fit below and does fit above
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (!open || !anchor || !panel) return;
    const a = anchor.getBoundingClientRect();
    const height = panel.offsetHeight;
    const fitsBelow = a.bottom + 6 + height <= window.innerHeight - 8;
    const fitsAbove = a.top - 6 - height >= 8;
    panel.classList.toggle(styles.up, !fitsBelow && fitsAbove);
  }, [open]);

  return (
    <div ref={anchorRef} className={cx(styles.anchor, className)}>
      {trigger}
      {open ? (
        <div ref={panelRef} className={cx(styles.panel, panelClassName)}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
