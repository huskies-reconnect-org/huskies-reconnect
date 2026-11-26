"use client";

import { useState } from "react";
import { api, type Icebreaker, type Match } from "@/lib/api";
import { Button, ClassmateCard, IntroCard, Notice } from "@/components/ui";

// Raw cosine similarity isn't shown: unrelated profiles still score ~0.8, which would read as "80%".
const STRENGTH = {
  strong: "Strong match",
  good: "Good match",
  possible: "Possible match",
} as const;

type Draft =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; message: string }
  | { kind: "blocked" }
  | { kind: "error"; message: string };

export function MatchCard({ courseId, courseCode, match: m }: { courseId: string; courseCode: string; match: Match }) {
  const [draft, setDraft] = useState<Draft>({ kind: "idle" });
  const [copied, setCopied] = useState(false);
  const name = m.full_name ?? "Classmate";

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
    <li className="flex flex-col gap-3">
      <ClassmateCard
        name={name}
        courseCode={courseCode}
        program={[m.major, m.grad_year && `Class of ${m.grad_year}`].filter(Boolean).join(" · ")}
        context={m.is_demo ? "Demo profile" : undefined}
        strength={{ label: STRENGTH[m.strength], tone: m.strength }}
        details={[
          { label: "Interests", text: m.interests ?? "" },
          { label: "Goals", text: m.goals ?? "" },
        ]}
      >
        {draft.kind === "idle" ? (
          <Button variant="secondary" onClick={draftIntro}>Draft intro</Button>
        ) : null}
        {draft.kind === "error" ? (
          <div className="flex flex-col items-start gap-2">
            <Notice tone="error" title="No intro this time" className="w-full">
              {draft.message}
            </Notice>
            <Button variant="secondary" onClick={draftIntro}>Retry</Button>
          </div>
        ) : null}
      </ClassmateCard>

      {draft.kind === "loading" ? (
        <IntroCard recipientName={name} courseCode={courseCode} safety="checking" />
      ) : null}
      {draft.kind === "ok" ? (
        <IntroCard
          recipientName={name}
          courseCode={courseCode}
          safety="passed"
          body={draft.message}
          actions={
            <>
              <Button variant="secondary" onClick={() => copy(draft.message)}>{copied ? "Copied" : "Copy"}</Button>
              <Button variant="quiet" onClick={draftIntro}>Regenerate</Button>
            </>
          }
        />
      ) : null}
      {draft.kind === "blocked" ? (
        <IntroCard
          recipientName={name}
          courseCode={courseCode}
          safety="held"
          safetyReason="Our safety check didn't pass the drafts for this pair."
          actions={<Button variant="secondary" onClick={draftIntro}>Try again</Button>}
        />
      ) : null}
    </li>
  );
}
