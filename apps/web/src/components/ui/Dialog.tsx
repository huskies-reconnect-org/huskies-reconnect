"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type DialogProps = {
  open: boolean;
  /** Called on Escape, on a click outside the card, and by your own Cancel button. */
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Buttons, primary last. */
  actions?: ReactNode;
  className?: string;
};

/**
 * The one modal shell. Native <dialog>, so focus trapping and Escape come from the
 * browser. The scrim is solid ink at 60%: no blur, no glass.
 */
export function Dialog({ open, onClose, title, children, actions, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-card p-0 text-ink backdrop:bg-ink/60",
        className,
      )}
    >
      <div className="p-6 sm:p-7">
        <h2 id={titleId} className="voice-casual text-heading font-extrabold">
          {title}
        </h2>
        <div className="mt-2 text-muted">{children}</div>
        {actions ? <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div> : null}
      </div>
    </dialog>
  );
}
