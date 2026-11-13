import Link from "next/link";
import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type MonoLabelProps = {
  as?: ElementType;
  id?: string;
  /** "muted" on heather or cards, "on-ink" on the header band. */
  tone?: "muted" | "ink" | "on-ink";
  className?: string;
  children: ReactNode;
};

const labelTones = {
  muted: "text-muted",
  ink: "text-ink",
  "on-ink": "text-on-ink-muted",
};

/**
 * Small uppercase mono label: section labels, card headers, counts.
 * It labels; it never carries the only copy of important information.
 */
export function MonoLabel({ as: Tag = "p", id, tone = "muted", className, children }: MonoLabelProps) {
  return (
    <Tag
      id={id}
      className={cn(
        "voice-mono text-label font-semibold uppercase tracking-[0.04em]",
        labelTones[tone],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** A course code such as "CS 3500". Never wraps between subject and number. */
export function CourseCode({ code, className }: { code: string; className?: string }) {
  return <span className={cn("voice-mono whitespace-nowrap font-semibold", className)}>{code}</span>;
}

/**
 * Red marker underline for what two classmates share.
 * Mark the shared thing only ("product design co-ops"), not the whole sentence.
 */
export function Marker({ children }: { children: ReactNode }) {
  return <mark className="mark-shared">{children}</mark>;
}

/** The product name. Links home. */
export function Wordmark({ tone = "ink", className }: { tone?: "ink" | "on-ink"; className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "voice-casual text-[1.375rem] font-extrabold leading-none no-underline",
        tone === "on-ink" ? "text-on-ink focus-visible:outline-on-ink" : "text-ink",
        className,
      )}
    >
      Huskies Reconnect
    </Link>
  );
}
