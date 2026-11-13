"use client";
// @giosbuild/field 0.1.0

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import styles from "./field.module.css";

/*
 * Form fields: a label over its control, with an error below it, and the
 * controls that go in it. Filled and rounded, with a two-layer focus ring (a
 * solid edge and a soft halo outside it). Every colour, corner and font is a
 * --ui-* token from the theme file, so a theme reskins them all.
 */

// joined with a template literal, not join(" "): the shadcn CLI rewrites plain
// string literals in some setups (tailwind.cssVariables: false), and " " would
// come out as ""
const cx = (...names: (string | false | null | undefined)[]) =>
  names.filter(Boolean).reduce<string>((all, name) => (all ? `${all} ${name}` : (name as string)), "");

export interface FieldProps {
  label: string;
  /** the control's id; leave out for a group of controls and pass labelId */
  htmlFor?: string;
  labelId?: string;
  optional?: boolean;
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, labelId, optional = false, error, errorId, className, children }: FieldProps) {
  const LabelTag = htmlFor ? "label" : "span";
  return (
    <div className={cx(styles.field, className)}>
      <LabelTag className={styles.label} htmlFor={htmlFor} id={labelId}>
        {label}
        {optional ? <span className={styles.optional}>Optional</span> : null}
      </LabelTag>
      {children}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(styles.control, className)} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(styles.control, styles.textarea, className)} />;
}
