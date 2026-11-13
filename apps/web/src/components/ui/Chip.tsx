import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A static tag on a card: an interest, a section, a term. Not clickable. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "voice-linear inline-flex items-center rounded-tag bg-card-edge px-2.5 py-1 text-small font-semibold text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}

type ChipToggleProps = Omit<ComponentProps<"input">, "type" | "className" | "children"> & {
  children: ReactNode;
  className?: string;
};

/**
 * A checkbox styled as a pill, for picking several options (profile interests, goals).
 * Selected state is a filled ink pill. Group several inside <fieldset> with a <legend>.
 */
export function ChipToggle({ children, className, ...inputProps }: ChipToggleProps) {
  return (
    <label
      className={cn(
        "voice-linear inline-flex h-10 select-none items-center rounded-full border-2 border-ink px-4 text-small font-semibold text-ink transition-colors hover:bg-card-edge",
        "has-[:checked]:bg-ink has-[:checked]:text-on-ink",
        "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "cursor-pointer",
        className,
      )}
    >
      <input type="checkbox" className="sr-only" {...inputProps} />
      {children}
    </label>
  );
}
