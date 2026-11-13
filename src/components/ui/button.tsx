"use client";
// @giosbuild/button 0.2.1

import type { ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

/*
 * The primary button: the one action a form or section leads to. Its fill,
 * corners, weight and press come from the --ui-button-* tokens in the theme
 * file, so it's a blue pill in saas and an ink block with a hard shadow in
 * bold. It's type="button" unless you pass type="submit".
 */

// joined with a template literal, not join(" "): the shadcn CLI rewrites plain
// string literals in some setups (tailwind.cssVariables: false), and " " would
// come out as ""
const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).reduce<string>((all, name) => (all ? `${all} ${name}` : (name as string)), "");

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** stretches to fill its container, e.g. under a form */
  fullWidth?: boolean;
}

export function Button({ type = "button", fullWidth = false, className, children, ...props }: ButtonProps) {
  return (
    <button {...props} type={type} className={cx(styles.button, fullWidth && styles.fullWidth, className)}>
      <span className={styles.label}>{children}</span>
    </button>
  );
}
