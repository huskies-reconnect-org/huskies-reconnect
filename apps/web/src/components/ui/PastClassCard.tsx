import Link from "next/link";
import type { ReactNode } from "react";
import { MonoLabel } from "./Text";
import { cn } from "@/lib/cn";

type PastClassCardProps = {
  code: string;
  /** "Spring 2026" */
  term: string;
  /** Why this class is back now. One sentence; wrap the shared thing in <Marker>. */
  children: ReactNode;
  href: string;
  linkLabel: string;
  className?: string;
};

/**
 * A past class resurfacing. It is the one card allowed a slight tilt:
 * it reads as an old card pulled out of the box.
 */
export function PastClassCard({ code, term, children, href, linkLabel, className }: PastClassCardProps) {
  return (
    <div className={cn("-rotate-1 rounded-tile bg-card p-4 text-ink", className)}>
      <MonoLabel>
        {code} · {term} · class network
      </MonoLabel>
      <p className="voice-casual mt-1.5 text-lead font-semibold leading-snug">{children}</p>
      <Link href={href} className="mt-2.5 inline-block font-bold text-ink underline underline-offset-4 hover:text-red-ink">
        {linkLabel}
      </Link>
    </div>
  );
}
