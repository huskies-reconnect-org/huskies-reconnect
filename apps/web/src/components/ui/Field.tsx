"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldFrameProps = {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

const control =
  "voice-linear block w-full rounded-field border-2 border-ink bg-field px-3.5 text-lead text-ink placeholder:text-muted aria-invalid:border-red disabled:cursor-not-allowed disabled:opacity-60";

function FieldFrame({ id, label, hint, error, className, children }: FieldFrameProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-small text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-small font-semibold text-red-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

type CommonProps = {
  label: ReactNode;
  /** Helper text under the field. Hidden while an error shows. */
  hint?: ReactNode;
  /** What went wrong and how to fix it. Sets aria-invalid. */
  error?: ReactNode;
  className?: string;
};

export type TextFieldProps = CommonProps & Omit<ComponentProps<"input">, "className">;

/** Labelled text input. Always visible label; placeholder is an example, never the label. */
export function TextField({ label, hint, error, className, id, ...props }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} className={className}>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "h-12")}
        {...props}
      />
    </FieldFrame>
  );
}

export type TextAreaFieldProps = CommonProps & Omit<ComponentProps<"textarea">, "className">;

export function TextAreaField({ label, hint, error, className, id, rows = 5, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} className={className}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "resize-y py-3 leading-normal")}
        {...props}
      />
    </FieldFrame>
  );
}

export type SelectFieldProps = CommonProps & Omit<ComponentProps<"select">, "className">;

export function SelectField({ label, hint, error, className, id, children, ...props }: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldFrame id={fieldId} label={label} hint={hint} error={error} className={className}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "h-12")}
        {...props}
      >
        {children}
      </select>
    </FieldFrame>
  );
}
