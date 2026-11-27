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

/** `inverse` is for the red header/footer: white paw, text color inherited. */
export function Wordmark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <PawIcon className={`h-7 w-7 ${inverse ? "fill-white" : "fill-husky"}`} />
      <span className="font-display text-lg font-bold tracking-tight">Huskies Reconnect</span>
    </span>
  );
}
