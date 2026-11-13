import type { ReactNode } from "react";
import { Button } from "./Button";
import { CourseCode } from "./Text";
import { cn } from "@/lib/cn";

/** A list of course search results on an index card. Rows are split by dashed rules. */
export function CourseList({ children, label, className }: { children: ReactNode; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("divide-y-2 divide-dashed divide-rule rounded-card bg-card px-5", className)}>
      {children}
    </ul>
  );
}

type CourseRowProps = {
  code: string;
  title: string;
  /** "Section 02 · CRN 10234 · Tue and Fri 9:50" */
  details?: string;
  /** "38 classmates here". Leave out when unknown; never invent a number. */
  members?: string;
  joined?: boolean;
  joining?: boolean;
  onJoin?: () => void;
};

/** One course search result with its Join action. */
export function CourseRow({ code, title, details, members, joined = false, joining = false, onJoin }: CourseRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4">
      <div className="min-w-0 flex-[1_1_16rem]">
        <CourseCode code={code} className="text-small text-muted" />
        <p className="font-bold leading-snug">{title}</p>
        {details ? <p className="text-small text-muted">{details}</p> : null}
      </div>
      {members ? <p className="text-small text-muted">{members}</p> : null}
      {joined ? (
        <p className="voice-mono text-label font-semibold uppercase tracking-[0.04em]">Joined</p>
      ) : (
        <Button variant="secondary" onClick={onJoin} disabled={joining}>
          {joining ? "Joining" : "Join"}
        </Button>
      )}
    </li>
  );
}
