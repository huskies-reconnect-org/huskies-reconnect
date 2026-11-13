import { IndexCard } from "./IndexCard";
import { cn } from "@/lib/cn";

/** A loading block shaped like the content it stands in for. */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("block animate-pulse-soft rounded-tag bg-card-edge", className)} />;
}

/** Placeholder for a ClassmateCard while the deck loads. */
export function ClassmateCardSkeleton({ className }: { className?: string }) {
  return (
    <IndexCard className={cn("flex min-h-[26rem] flex-col", className)}>
      <span role="status" className="sr-only">
        Loading classmates
      </span>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-5 size-[54px] rounded-full" />
      <Skeleton className="mt-4 h-9 w-3/4" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <hr className="my-5 border-0 border-t-2 border-dashed border-rule" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-5 w-full" />
      <Skeleton className="mt-2 h-5 w-5/6" />
      <Skeleton className="mt-2 h-5 w-2/3" />
    </IndexCard>
  );
}
