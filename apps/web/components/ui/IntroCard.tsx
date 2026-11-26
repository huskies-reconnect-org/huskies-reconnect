// Ported from Shaad Qureshi's UI library (PR #2).
// Adapted: no in-app editing or sending (students copy the intro and send it themselves),
// so the edit mode is left out and the footer copy says how it actually works.
import type { ReactNode } from "react";
import { IndexCard } from "./IndexCard";
import { Notice } from "./Notice";
import { CourseCode } from "./Text";
import { SafetyStatus, type SafetyState } from "./SafetyStatus";
import { cn } from "@/lib/cn";

export type IntroCardProps = {
  /** Full name of the person the intro is for. The card uses the first name. */
  recipientName: string;
  courseCode: string;
  /** The drafted intro. Ignored while checking or when held. */
  body?: string;
  safety: SafetyState;
  /** Shown when safety is "held": what happened, as a plain sentence. */
  safetyReason?: string;
  /** Buttons (Copy, Regenerate, Try again). */
  actions?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
};

/** The drafted intro, its safety status, and what to do with it. */
export function IntroCard({
  recipientName,
  courseCode,
  body,
  safety,
  safetyReason,
  actions,
  headingLevel = 3,
  className,
}: IntroCardProps) {
  const firstName = recipientName.trim().split(/\s+/)[0] || recipientName;
  const Heading = (`h${headingLevel}` as "h2" | "h3" | "h4");
  const headingId = `intro-${firstName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <IndexCard as="article" aria-labelledby={headingId} className={cn("flex h-full flex-col", className)}>
      <div className="voice-mono flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-label font-semibold text-muted">
        <CourseCode code={courseCode} />
        <SafetyStatus state={safety} />
      </div>
      <Heading id={headingId} className="voice-casual mt-5 text-heading font-extrabold">
        Intro to {firstName}
      </Heading>
      {safety === "checking" ? (
        <p className="voice-casual ruled mt-2 text-[1.25rem] text-muted">Drafting an intro for {firstName}…</p>
      ) : null}
      {safety === "passed" && body ? (
        <p className="voice-casual ruled mt-2 whitespace-pre-wrap text-[1.25rem]">{body}</p>
      ) : null}
      {safety === "held" ? (
        <Notice tone="error" title="This intro was held back" className="mt-4">
          {safetyReason ?? "The safety check stopped the draft."} Try again for a new draft.
        </Notice>
      ) : null}
      {actions ? <div className="mt-5 flex flex-wrap items-center gap-2">{actions}</div> : null}
      {safety === "passed" ? (
        <p className="mt-auto pt-5 text-small text-muted">
          We drafted this from what you both shared. You send it yourself, so make it sound like you.
        </p>
      ) : null}
    </IndexCard>
  );
}
