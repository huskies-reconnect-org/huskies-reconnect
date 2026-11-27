"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { api, type Icebreaker, type Match } from "@/lib/api";
import { Avatar } from "@/components/Avatar";
import { PawLoader } from "@/components/PawLogo";
import { splitInterests } from "@/lib/avatar";

// Raw cosine similarity isn't shown: unrelated profiles still score ~0.8, which would read as "80%".
const STRENGTH = {
  strong: { label: "Strong match", bars: 3, className: "bg-husky text-white", on: "bg-white", off: "bg-white/40" },
  good: { label: "Good match", bars: 2, className: "bg-blush text-husky-ink", on: "bg-husky", off: "bg-[#ebc3ca]" },
  possible: { label: "Possible match", bars: 1, className: "bg-stone text-[#3f3a36]", on: "bg-muted", off: "bg-[#d3ccc5]" },
} as const;

type Draft =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; message: string }
  | { kind: "blocked" }
  | { kind: "error"; message: string };

/** Reveals `full` a few characters at a time, then hands it over for editing. */
function useTypedText(full: string | null): { text: string; typing: boolean } {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Reset while there's no draft (e.g. during Regenerate), so the next draft
    // doesn't flash in at the previous draft's length.
    if (full === null) {
      setShown(0);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(full.length);
      return;
    }
    setShown(0);
    let n = 0;
    const id = window.setInterval(() => {
      n = Math.min(full.length, n + 3);
      setShown(n);
      if (n >= full.length) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [full]);

  if (full === null) return { text: "", typing: false };
  return { text: full.slice(0, shown), typing: shown < full.length };
}

export function MatchCard({ courseId, match: m }: { courseId: string; match: Match }) {
  const [draft, setDraft] = useState<Draft>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const [edited, setEdited] = useState<string | null>(null);

  const typed = useTypedText(draft.kind === "ok" ? draft.message : null);
  const message = edited ?? typed.text;

  // Grow the intro box to fit its text, so nothing is cut off on a phone.
  // (CSS `field-sizing: content` isn't supported in every mobile browser yet.)
  const box = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight + 2}px`; // + top/bottom border
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [message, draft.kind]);

  async function draftIntro() {
    setDraft({ kind: "loading" });
    setCopied(false);
    setEdited(null);
    try {
      const r = await api<Icebreaker>(`/courses/${courseId}/matches/${m.user_id}/icebreaker`, { method: "POST" });
      setDraft(r.status === "ok" && r.message ? { kind: "ok", message: r.message } : { kind: "blocked" });
    } catch (e) {
      setDraft({ kind: "error", message: (e as Error).message });
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const s = STRENGTH[m.strength];
  const tags = splitInterests(m.interests);
  const firstName = (m.full_name ?? "").split(" ")[0] || "your classmate";

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar id={m.user_id} name={m.full_name} color={m.avatar_color} badge={m.avatar_badge} />
        <div className="flex min-w-[11rem] flex-1 flex-col gap-0.5">
          <p className="flex flex-wrap items-center gap-2 text-lg font-semibold">
            {m.full_name ?? "Classmate"}
            {m.is_demo && (
              <span
                className="rounded-md bg-sand px-1.5 py-0.5 text-xs font-normal text-muted"
                title="Fictional student seeded for the demo"
              >
                Demo profile
              </span>
            )}
          </p>
          <p className="text-sm text-muted">
            {[m.major, m.grad_year && `Class of ${m.grad_year}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-semibold ${s.className}`}>
          <span className="flex gap-0.5" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <span key={i} className={`h-3 w-1 rounded-sm ${i <= s.bars ? s.on : s.off}`} />
            ))}
          </span>
          {s.label}
        </span>
      </div>

      {m.goals && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Goals</span>
          <p className="font-display text-xl font-semibold leading-snug">{m.goals}</p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Interests</span>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t, i) => (
              <li key={`${i}-${t}`} className="rounded-full bg-sand px-3 py-1.5 text-sm">{t}</li>
            ))}
          </ul>
        </div>
      )}

      {draft.kind === "idle" && (
        <button
          onClick={draftIntro}
          className="self-start rounded-lg bg-husky px-4 py-3 text-sm font-semibold text-white hover:bg-husky-deep"
        >
          Draft intro
        </button>
      )}

      {draft.kind === "loading" && (
        <p className="flex items-center gap-2 text-sm font-medium text-husky-deep" role="status">
          <PawLoader />
          Drafting an intro…
        </p>
      )}

      {draft.kind === "ok" && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-cream p-4">
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Your intro to {firstName}
            <textarea
              ref={box}
              rows={3}
              value={message}
              readOnly={typed.typing && edited === null}
              onChange={(e) => {
                setEdited(e.target.value);
                setCopied(false);
              }}
              className="resize-none overflow-hidden rounded-lg border border-field bg-white px-3.5 py-3 text-[15px] font-normal leading-relaxed text-ink"
            />
          </label>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => copy(message)}
              disabled={typed.typing && edited === null}
              className="inline-flex min-h-11 items-center rounded-lg bg-ink px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={draftIntro}
              className="inline-flex min-h-11 items-center rounded-lg border border-field bg-white px-4 text-sm font-semibold"
            >
              Regenerate
            </button>
            <p className="flex items-center gap-1.5 text-xs text-muted sm:ml-auto">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-[#1f6b3a] stroke-2">
                <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              AI-drafted and safety-checked. Edit it to sound like you before sending.
            </p>
          </div>
        </div>
      )}

      {draft.kind === "blocked" && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-cream p-4 text-sm text-[#3f3a36]">
          <span>We couldn&apos;t draft an intro that passed our safety check.</span>
          <button
            onClick={draftIntro}
            className="inline-flex min-h-11 items-center rounded-lg border border-field bg-white px-4 font-semibold text-ink"
          >
            Try again
          </button>
        </div>
      )}
      {draft.kind === "error" && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[#ead9a6] bg-[#fdf6e3] p-4 text-sm text-[#4a3c0b]">
          <span>{draft.message}</span>
          <button
            onClick={draftIntro}
            className="inline-flex min-h-11 items-center rounded-lg border border-[#ead9a6] bg-white px-4 font-semibold"
          >
            Retry
          </button>
        </div>
      )}
    </li>
  );
}
