"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FlipCardProps = {
  /** The classmate side. Usually <ClassmateCard>. */
  front: ReactNode;
  /** The intro side. Usually <IntroCard>. */
  back: ReactNode;
  /** Controlled: the parent owns which side shows (DeckActions toggles it). */
  flipped: boolean;
  className?: string;
};

/**
 * One card, two faces. The hidden face is `inert`, so keyboard and screen reader
 * users only ever reach the side that is showing. Reduced motion swaps instantly.
 * The flip is the one signature motion in the product; do not add others nearby.
 */
export function FlipCard({ front, back, flipped, className }: FlipCardProps) {
  return (
    <div className={cn("perspective-[1600px]", className)}>
      <div
        className={cn(
          "grid h-full transition-transform duration-500 ease-out transform-3d motion-reduce:transition-none",
          flipped && "rotate-y-180",
        )}
      >
        <div className="h-full backface-hidden [grid-area:1/1]" inert={flipped}>
          {front}
        </div>
        <div className="h-full rotate-y-180 backface-hidden [grid-area:1/1]" inert={!flipped}>
          {back}
        </div>
      </div>
    </div>
  );
}
