export function PawIcon({ className = "h-6 w-6 fill-husky" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <ellipse cx="12" cy="16" rx="5" ry="4.2" />
      <circle cx="5.5" cy="10" r="2.2" />
      <circle cx="18.5" cy="10" r="2.2" />
      <circle cx="9" cy="5.5" r="2.2" />
      <circle cx="15" cy="5.5" r="2.2" />
    </svg>
  );
}

/** Logo. The paw gives a small wave when its link is hovered (`group` on the link). */
export function Wordmark() {
  return (
    <span className="flex items-center gap-2.5">
      <PawIcon className="paw-wave h-7 w-7 fill-husky" />
      <span className="font-display text-lg font-bold tracking-tight">Huskies Reconnect</span>
    </span>
  );
}

/** Loading indicator: three paws stepping in turn. Pair it with visible text. */
export function PawLoader({ className = "h-4 w-4 fill-husky" }: { className?: string }) {
  return (
    <span aria-hidden="true" className="inline-flex items-end gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="paw-step" style={{ animationDelay: `${i * 0.18}s` }}>
          <PawIcon className={`${className} ${i % 2 ? "-rotate-12" : "translate-y-[-3px] rotate-12"}`} />
        </span>
      ))}
    </span>
  );
}
