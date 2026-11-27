// Rotating one-liners that say what the app is for. Each line rises in word by word,
// holds, then gives way to the next (CSS only, `mq-*` in globals.css). Screen readers
// get every line once as plain text; reduced motion shows the first line, still.
const LINES: string[] = [
  "Classes end. *Your classmates* don't have to.",
  "Meet the people in your course you'd *actually click with.*",
  "We find the match. *You send the hi.*",
  "The semester ends in December. *Your pack doesn't.*",
  "From strangers in lecture to *friends after finals.*",
];
const HOLD_S = 4; // seconds each line stays up

function words(line: string): { text: string; accent: boolean }[] {
  // *...* marks the accent phrase.
  return line.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((part) => {
    const accent = part.startsWith("*");
    return part.replace(/\*/g, "").split(" ").filter(Boolean).map((text) => ({ text, accent }));
  });
}

export function MotionQuote({ size = "md", className = "" }: { size?: "md" | "lg"; className?: string }) {
  const cycle = LINES.length * HOLD_S;
  const text = size === "lg"
    ? "text-[26px] leading-tight sm:text-4xl"
    : "text-[22px] leading-snug sm:text-[26px]";
  return (
    <div className={className}>
      <p className="sr-only">{LINES.map((l) => l.replace(/\*/g, "")).join(" ")}</p>
      <div aria-hidden="true" className={`grid font-display font-semibold tracking-tight text-ink ${text}`}>
        {LINES.map((line, li) => (
          <p key={li} className="mq-line [grid-area:1/1]">
            {words(line).map((w, wi) => (
              <span
                key={wi}
                className={`mq-word inline-block whitespace-pre ${w.accent ? "text-husky" : ""}`}
                style={{
                  animationDuration: `${cycle}s`,
                  animationDelay: `${li * HOLD_S + wi * 0.07}s`,
                }}
              >
                {w.text}{" "}
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  );
}
