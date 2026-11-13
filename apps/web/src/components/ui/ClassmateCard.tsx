import { IndexCard } from "./IndexCard";
import { Monogram } from "./Monogram";
import { MonoLabel, CourseCode, Marker } from "./Text";
import { cn } from "@/lib/cn";

/**
 * One reason two classmates were matched, as a full sentence written to the viewer.
 * `highlight` is the exact shared phrase inside `text`; it gets the red marker.
 * Example: { text: "You're both applying for product design co-ops this spring.",
 *            highlight: "product design co-ops" }
 */
export type SharedReason = { text: string; highlight?: string };

export function ReasonText({ reason }: { reason: SharedReason }) {
  const { text, highlight } = reason;
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <Marker>{highlight}</Marker>
      {text.slice(at + highlight.length)}
    </>
  );
}

export type ClassmateCardProps = {
  name: string;
  /** Major and year, e.g. "Computer Science and Design · 3rd year". */
  program: string;
  courseCode: string;
  /** Where you overlap in the course, e.g. "Tuesday lab". Optional. */
  context?: string;
  /** Two or three reasons. Never a score or percentage. */
  reasons: SharedReason[];
  headingLevel?: 2 | 3;
  className?: string;
};

/** The front of a classmate card: who they are and why you two were matched. */
export function ClassmateCard({
  name,
  program,
  courseCode,
  context,
  reasons,
  headingLevel = 2,
  className,
}: ClassmateCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const Sub = headingLevel === 2 ? "h3" : "h4";
  const headingId = `classmate-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <IndexCard as="article" aria-labelledby={headingId} className={cn("flex h-full flex-col", className)}>
      <div className="voice-mono flex justify-between gap-3 text-label font-semibold text-muted">
        <CourseCode code={courseCode} />
        {context ? <span>{context}</span> : null}
      </div>
      <Monogram name={name} size="lg" className="mt-5" />
      <Heading id={headingId} className="voice-casual mt-3.5 text-display-sm font-extrabold sm:text-name">
        {name}
      </Heading>
      <p className="mt-0.5 text-muted">{program}</p>
      <hr className="my-5 border-0 border-t-2 border-dashed border-rule" />
      <MonoLabel as={Sub}>In common</MonoLabel>
      <ul className="voice-casual mt-2.5 flex flex-col gap-2 text-note">
        {reasons.map((reason) => (
          <li key={reason.text}>
            <ReasonText reason={reason} />
          </li>
        ))}
      </ul>
    </IndexCard>
  );
}
