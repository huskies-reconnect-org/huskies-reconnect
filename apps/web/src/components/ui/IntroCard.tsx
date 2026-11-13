import { IndexCard } from "./IndexCard";
import { TextAreaField } from "./Field";
import { Notice } from "./Notice";
import { CourseCode } from "./Text";
import { SafetyStatus, type SafetyState } from "./SafetyStatus";
import { cn } from "@/lib/cn";

export type IntroCardProps = {
  /** Full name of the person the intro is for. The card uses the first name. */
  recipientName: string;
  courseCode: string;
  body: string;
  safety: SafetyState;
  /** Required when safety is "held": what the check found, as a plain sentence. */
  safetyReason?: string;
  /**
   * True when the AI pipeline wrote the first draft (the default). The card then says so
   * in plain words. Set false for an intro the person wrote from scratch.
   */
  drafted?: boolean;
  /** Edit mode swaps the ruled text for a textarea. Requires a client parent. */
  editing?: boolean;
  onBodyChange?: (value: string) => void;
  maxLength?: number;
  headingLevel?: 2 | 3;
  className?: string;
};

/** The back of a classmate card: the drafted intro, its safety status, and edit mode. */
export function IntroCard({
  recipientName,
  courseCode,
  body,
  safety,
  safetyReason,
  drafted = true,
  editing = false,
  onBodyChange,
  maxLength = 600,
  headingLevel = 2,
  className,
}: IntroCardProps) {
  const firstName = recipientName.trim().split(/\s+/)[0] ?? recipientName;
  const Heading = headingLevel === 2 ? "h2" : "h3";
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
      {editing ? (
        <TextAreaField
          label="Your intro"
          hint={`${body.length} of ${maxLength} characters. It's checked again before it sends.`}
          value={body}
          maxLength={maxLength}
          rows={6}
          onChange={(event) => onBodyChange?.(event.target.value)}
          className="mt-3"
        />
      ) : (
        <p className="voice-casual ruled mt-2 text-[1.25rem]">{body}</p>
      )}
      {safety === "held" ? (
        <Notice tone="error" title="This intro won't send as written" className="mt-4">
          {safetyReason ?? "The safety check flagged part of it."} Edit it, or write your own.
        </Notice>
      ) : null}
      <p className="mt-auto pt-5 text-small text-muted">
        {drafted ? "We drafted this from what you both shared. " : null}
        {firstName} sees it only after you send it.
      </p>
    </IndexCard>
  );
}
