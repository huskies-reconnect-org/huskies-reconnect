import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  title: string;
  /** What will show up here and what to do to get it. */
  children: ReactNode;
  /** The one action that fills this space: a Button or ButtonLink. */
  action?: ReactNode;
  headingLevel?: 2 | 3;
  className?: string;
};

/** An empty card slot. Always points at the next step; never just says "Nothing here". */
export function EmptyState({ title, children, action, headingLevel = 2, className }: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className={cn("rounded-card border-2 border-dashed border-heather-deep p-6 sm:p-7", className)}>
      <Heading className="voice-casual text-heading font-extrabold">{title}</Heading>
      <div className="mt-2 max-w-[60ch] text-muted">{children}</div>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
