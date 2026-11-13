import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type IndexCardProps = {
  as?: ElementType;
  padding?: "md" | "lg";
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
  children: ReactNode;
};

/**
 * The base surface: a cream index card on the heather table.
 * No shadow, no border, no accent stripe. Depth comes from <CardStack>, not from shadows.
 */
export function IndexCard({ as: Tag = "div", padding = "lg", className, children, ...aria }: IndexCardProps) {
  return (
    <Tag
      className={cn("rounded-card bg-card text-ink", padding === "lg" ? "p-6 sm:p-7" : "p-4", className)}
      {...aria}
    >
      {children}
    </Tag>
  );
}

type CardStackProps = {
  /** How many cards sit under the top one (0 to 2). Reflects the real count left in the deck. */
  depth?: 0 | 1 | 2;
  className?: string;
  children: ReactNode;
};

/**
 * Stacks the child card on top of up to two offset cards.
 * Use only where there really is a deck (more cards to come). The layers are decorative.
 */
export function CardStack({ depth = 2, className, children }: CardStackProps) {
  return (
    <div className={cn("relative", className)}>
      {depth >= 2 ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-2 rounded-card bg-card-edge-deep"
        />
      ) : null}
      {depth >= 1 ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 -translate-x-1 translate-y-1 -rotate-2 rounded-card bg-card-edge"
        />
      ) : null}
      <div className="relative h-full">{children}</div>
    </div>
  );
}
