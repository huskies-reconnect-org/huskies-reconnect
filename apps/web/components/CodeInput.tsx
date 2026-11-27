"use client";

import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const LEN = 6;

/**
 * Six one-digit boxes for the email code. `value` is the digits typed so far (no gaps).
 * Typing moves forward, Backspace moves back, and pasting or phone autofill
 * (`autocomplete="one-time-code"` on the first box) fills every box at once.
 */
export function CodeInput({
  value, onChange, autoFocus = false, disabled = false,
}: {
  value: string;
  onChange: (code: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [focused, setFocused] = useState<number | null>(null);
  // Latest digits, updated before we move focus, so the focus handler never sees a stale value.
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const focusBox = (i: number) => refs.current[Math.max(0, Math.min(LEN - 1, i))]?.focus();

  function put(i: number, digits: string) {
    const next = (value.slice(0, i) + digits + value.slice(i + digits.length)).slice(0, LEN);
    latest.current = next;
    onChange(next);
    focusBox(i + digits.length);
  }

  function handleChange(i: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    // Typing over a filled box gives two characters: keep the new one.
    put(i, digits.length === 2 && value[i] ? digits.slice(-1) : digits);
  }

  function handleKey(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        latest.current = value.slice(0, i) + value.slice(i + 1);
        onChange(latest.current);
      } else if (i > 0) {
        latest.current = value.slice(0, i - 1) + value.slice(i);
        onChange(latest.current);
        focusBox(i - 1);
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusBox(Math.min(i + 1, value.length));
    }
  }

  function handlePaste(i: number, e: ClipboardEvent<HTMLInputElement>) {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!digits) return;
    e.preventDefault();
    put(i, digits);
  }

  return (
    <div className="flex w-full justify-between gap-2 sm:gap-2.5" role="group" aria-label="6-digit code">
      {Array.from({ length: LEN }, (_, i) => {
        const filled = Boolean(value[i]);
        const active = focused === i;
        return (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            value={value[i] ?? ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={(e) => handlePaste(i, e)}
            // Never leave a gap: clicking past the typed digits lands on the next empty box.
            onFocus={() => (i > latest.current.length ? focusBox(latest.current.length) : setFocused(i))}
            onBlur={() => setFocused(null)}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1}`}
            disabled={disabled}
            className={`code-box aspect-square h-auto w-full min-w-0 max-w-14 rounded-xl border-2 bg-white text-center font-display text-2xl font-semibold text-ink caret-husky outline-none transition-colors ${
              active ? "border-husky" : filled ? "border-ink" : "border-field"
            }`}
          />
        );
      })}
    </div>
  );
}
