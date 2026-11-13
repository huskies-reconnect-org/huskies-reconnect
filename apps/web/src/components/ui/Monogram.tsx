import { cn } from "@/lib/cn";

/** First letter of the first and last word: "Maya Okafor" -> "MO". */
export function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

const sizes = {
  sm: "size-8 text-small",
  md: "size-10 text-[0.9375rem]",
  lg: "size-[54px] text-[1.25rem]",
};

const tones = {
  ink: "bg-ink text-on-ink",
  red: "bg-red text-on-red",
  card: "bg-card text-ink",
};

type MonogramProps = {
  name: string;
  size?: keyof typeof sizes;
  /** "ink" for classmates, "card" on the ink header. Use "red" only for the signed-in person. */
  tone?: keyof typeof tones;
  /** Set when the monogram stands alone (no visible name next to it). */
  label?: string;
  className?: string;
};

/**
 * Initials in a circle. This is the only avatar we use: no stock or generated faces.
 * If profile photos are added later, they must be uploaded by the person themselves.
 */
export function Monogram({ name, size = "md", tone = "ink", label, className }: MonogramProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn(
        "voice-casual inline-flex shrink-0 items-center justify-center rounded-full font-extrabold",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {initialsFrom(name)}
    </span>
  );
}
