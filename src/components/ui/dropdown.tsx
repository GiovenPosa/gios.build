"use client";
// @giosbuild/dropdown 0.1.0

import { useState, type KeyboardEvent } from "react";
import { Popover } from "./popover";
import styles from "./dropdown.module.css";

/*
 * A select that opens a popover listbox (the WAI-ARIA select-only pattern):
 * arrow keys move, Enter or Space picks, Escape and Tab close. Put it in a
 * <Field htmlFor={id}> for its label.
 */

// joined with a template literal, not join(" "): the shadcn CLI rewrites plain
// string literals in some setups (tailwind.cssVariables: false), and " " would
// come out as ""
const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).reduce<string>((all, name) => (all ? `${all} ${name}` : (name as string)), "");

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  id: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
}

function Check({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0,0,24,24" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Dropdown({ id, value, options, onChange, placeholder = "Select", invalid, describedBy, disabled }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];
  const optionId = (i: number) => `${id}-option-${i}`;
  const close = () => setOpen(false);

  function show() {
    setActive(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function choose(i: number) {
    onChange(options[i].value);
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return show();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    // the Space key by its code: a " " literal can be rewritten on install (see cx)
    } else if ((e.key === "Enter" || e.code === "Space") && open) {
      e.preventDefault();
      if (active >= 0) choose(active);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <Popover
      open={open}
      onClose={close}
      trigger={
        <button
          type="button"
          id={id}
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={open && active >= 0 ? optionId(active) : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : show())}
          onKeyDown={onKeyDown}
        >
          <span className={selected ? styles.value : styles.placeholder}>{selected?.label ?? placeholder}</span>
        </button>
      }
    >
      <ul id={`${id}-listbox`} role="listbox" className={styles.listbox} aria-labelledby={id}>
        {options.map((o, i) => {
          const isSelected = i === selectedIndex;
          return (
            <li
              key={o.value}
              id={optionId(i)}
              role="option"
              aria-selected={isSelected}
              className={cx(styles.option, i === active && styles.active, isSelected && styles.selected)}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              <span className={styles.optionLabel}>{o.label}</span>
              {isSelected ? <Check className={styles.check} /> : null}
            </li>
          );
        })}
      </ul>
    </Popover>
  );
}
