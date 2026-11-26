// Ported from Shaad Qureshi's UI library (PR #2).
// Adapted to our data: the API returns the classmate's own interests and goals, not
// computed "in common" reasons, so the card shows those under honest labels. The
// strength label (Strong / Good / Possible) is kept by product decision.
import type { ReactNode } from "react";
import { IndexCard } from "./IndexCard";
import { Monogram } from "./Monogram";
import { MonoLabel, CourseCode } from "./Text";
import { cn } from "@/lib/cn";

export type ClassmateDetail = { label: string; text: string };

export type ClassmateCardProps = {
  name: string;
  /** Major and year, e.g. "MS Computer Science · Class of 2027". */
  program?: string;
  courseCode: string;
  /** Top-right note, e.g. "Demo profile". Optional. */
  context?: string;
  /** Short label for how well you match, e.g. "Strong match". Optional. */
  strength?: { label: string; tone: "strong" | "good" | "possible" };
  /** What the classmate shared: interests, goals. Empty entries are skipped. */
  details: ClassmateDetail[];
  headingLevel?: 2 | 3;
  /** Actions or the drafted intro, below the card's content. */
  children?: ReactNode;
  className?: string;
};

const strengthTones = {
  strong: "bg-ink text-on-ink",
  good: "border-2 border-ink text-ink",
  possible: "border-2 border-dashed border-muted text-muted",
};

/** One classmate: who they are and what they shared. */
export function ClassmateCard({
  name,
  program,
  courseCode,
  context,
  strength,
  details,
  headingLevel = 2,
  children,
  className,
}: ClassmateCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  const headingId = `classmate-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const shown = details.filter((d) => d.text.trim());
  return (
    <IndexCard as="article" aria-labelledby={headingId} className={cn("flex h-full flex-col", className)}>
      <div className="voice-mono flex justify-between gap-3 text-label font-semibold text-muted">
        <CourseCode code={courseCode} />
        {context ? <span>{context}</span> : null}
      </div>
      <div className="mt-5 flex items-start justify-between gap-3">
        <Monogram name={name} size="lg" />
        {strength ? (
          <span
            className={cn(
              "voice-mono rounded-tag px-2 py-1 text-label font-semibold uppercase tracking-[0.04em]",
              strengthTones[strength.tone],
            )}
          >
            {strength.label}
          </span>
        ) : null}
      </div>
      <Heading id={headingId} className="voice-casual mt-3.5 text-display-sm font-extrabold sm:text-name">
        {name}
      </Heading>
      {program ? <p className="mt-0.5 text-muted">{program}</p> : null}
      {shown.length > 0 ? <hr className="my-5 border-0 border-t-2 border-dashed border-rule" /> : null}
      <div className="flex flex-col gap-4">
        {shown.map((d) => (
          <section key={d.label}>
            <MonoLabel as={Sub}>{d.label}</MonoLabel>
            <p className="voice-casual mt-1.5 text-note">{d.text}</p>
          </section>
        ))}
      </div>
      {children ? <div className="mt-auto pt-6">{children}</div> : null}
    </IndexCard>
  );
}
