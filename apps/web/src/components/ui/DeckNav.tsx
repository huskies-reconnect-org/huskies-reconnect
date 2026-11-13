import Link from "next/link";
import { Meter } from "./Progress";
import { cn } from "@/lib/cn";

function MiniStack() {
  return (
    <span aria-hidden="true" className="relative mt-0.5 h-7 w-[34px] shrink-0">
      <span className="absolute left-[5px] top-0 h-5 w-7 rounded-[3px] bg-card-edge-deep" />
      <span className="absolute left-0 top-1.5 h-5 w-7 rounded-[3px] border-2 border-card-edge-deep bg-card" />
    </span>
  );
}

type DeckLinkProps = {
  href: string;
  code: string;
  title: string;
  /** "4 cards", "1 card", "No new cards". */
  count: string;
  current?: boolean;
  className?: string;
};

/** One course deck in the sidebar. The current deck gets a red outline, never a side stripe. */
export function DeckLink({ href, code, title, count, current = false, className }: DeckLinkProps) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-tile p-3 text-ink no-underline transition-colors",
        current ? "bg-card outline-2 -outline-offset-2 outline-red" : "hover:bg-card-edge",
        className,
      )}
    >
      <MiniStack />
      <span className="flex min-w-0 flex-col">
        <span className="voice-mono text-small font-semibold text-muted">{code}</span>
        <span className="font-semibold leading-snug">{title}</span>
        <span className="text-small text-muted">{count}</span>
      </span>
    </Link>
  );
}

type DeckWaitingProps = {
  code: string;
  title: string;
  joined: number;
  /** How many classmates must join before suggestions start. */
  needed: number;
  className?: string;
};

/** A course that has no deck yet because too few classmates have joined. */
export function DeckWaiting({ code, title, joined, needed, className }: DeckWaitingProps) {
  return (
    <div className={cn("rounded-tile border-2 border-dashed border-heather-deep p-3", className)}>
      <span className="voice-mono block text-small font-semibold text-muted">{code}</span>
      <span className="block font-semibold leading-snug">{title}</span>
      <span className="mt-1 block text-small text-muted">
        Cards start at {needed} classmates. {joined} {joined === 1 ? "has" : "have"} joined.
      </span>
      <Meter value={joined} max={needed} label={`${joined} of ${needed} classmates joined`} className="mt-2" />
    </div>
  );
}
