"use client";

import { useState } from "react";
import { api, type Icebreaker, type Match } from "@/lib/api";

type Draft =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; message: string }
  | { kind: "blocked" }
  | { kind: "error"; message: string };

export function MatchCard({ courseId, match: m }: { courseId: string; match: Match }) {
  const [draft, setDraft] = useState<Draft>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  async function draftIntro() {
    setDraft({ kind: "loading" });
    setCopied(false);
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

  return (
    <li className="flex flex-col gap-2 rounded border p-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-medium">
          {m.full_name ?? "Classmate"}
          {m.is_demo && (
            <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-600"
              title="Fictional student seeded for the demo">
              Demo profile
            </span>
          )}
        </p>
        <span className="text-xs text-gray-500">{Math.round(m.similarity * 100)}% match</span>
      </div>
      <p className="text-sm text-gray-600">
        {[m.major, m.grad_year && `Class of ${m.grad_year}`].filter(Boolean).join(" · ")}
      </p>
      {m.interests && <p className="text-sm"><span className="font-medium">Interests:</span> {m.interests}</p>}
      {m.goals && <p className="text-sm"><span className="font-medium">Goals:</span> {m.goals}</p>}

      {draft.kind === "idle" && (
        <button onClick={draftIntro} className="self-start rounded bg-black px-3 py-1 text-sm text-white">
          Draft intro
        </button>
      )}
      {draft.kind === "loading" && <p className="text-sm text-gray-600">Drafting an intro…</p>}

      {draft.kind === "ok" && (
        <div className="flex flex-col gap-2 rounded bg-gray-50 p-3">
          <p className="whitespace-pre-wrap text-sm">{draft.message}</p>
          <div className="flex gap-2">
            <button onClick={() => copy(draft.message)} className="rounded bg-black px-3 py-1 text-sm text-white">
              {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={draftIntro} className="rounded border px-3 py-1 text-sm">Regenerate</button>
          </div>
          <p className="text-xs text-gray-500">AI-drafted and safety-checked. Edit it to sound like you before sending.</p>
        </div>
      )}

      {draft.kind === "blocked" && (
        <p className="text-sm text-amber-700">
          We couldn&apos;t draft an intro that passed our safety check.{" "}
          <button onClick={draftIntro} className="underline">Try again</button>
        </p>
      )}
      {draft.kind === "error" && (
        <p role="alert" className="text-sm text-red-600">
          {draft.message} <button onClick={draftIntro} className="underline">Retry</button>
        </p>
      )}
    </li>
  );
}
