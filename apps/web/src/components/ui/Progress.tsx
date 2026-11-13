import { cn } from "@/lib/cn";

/** "Card 2 of 4" with one pip per card. The text carries the meaning; pips are decoration. */
export function ProgressPips({ current, total, className }: { current: number; total: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", className)}>
      <span className="voice-mono text-small font-semibold">
        Card {current} of {total}
      </span>
      <span aria-hidden="true" className="flex gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            className={cn("h-1.5 w-7 rounded-full", index < current ? "bg-red" : "bg-heather-deep")}
          />
        ))}
      </span>
    </div>
  );
}

type MeterProps = {
  value: number;
  max: number;
  /** Accessible name, e.g. "6 of 10 classmates joined". Show the same fact as visible text. */
  label: string;
  className?: string;
};

/** A thin progress bar for a real quantity (classmates joined so far). */
export function Meter({ value, max, label, className }: MeterProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <span
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn("block h-1.5 rounded-full bg-heather-deep", className)}
    >
      <span className="block h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
    </span>
  );
}
