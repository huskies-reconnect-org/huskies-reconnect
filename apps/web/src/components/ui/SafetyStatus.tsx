import { cn } from "@/lib/cn";

/**
 * Where an AI-drafted intro is in the safety check.
 *   checking: still being reviewed. Not sendable.
 *   passed:   cleared. Sendable.
 *   held:     blocked. Not sendable. IntroCard shows the reason and the way forward.
 */
export type SafetyState = "checking" | "passed" | "held";

const labels: Record<SafetyState, string> = {
  checking: "Checking tone and privacy",
  passed: "Checked for tone and privacy",
  held: "Held back",
};

/** A short status label. Announced politely when it changes. */
export function SafetyStatus({ state, className }: { state: SafetyState; className?: string }) {
  return (
    <p
      role="status"
      className={cn(
        "voice-mono inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.04em]",
        state === "held" ? "text-red-ink" : "text-muted",
        className,
      )}
    >
      {state === "checking" ? (
        <span aria-hidden="true" className="size-2 animate-pulse-soft rounded-full bg-muted" />
      ) : null}
      {labels[state]}
    </p>
  );
}
