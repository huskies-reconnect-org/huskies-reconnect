"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type Course } from "@/lib/api";

/**
 * Quiet "Leave course" control for the bottom of a course page. Asks in place
 * (no browser pop-up) before removing the membership, then goes back to /courses.
 */
export function LeaveCourse({ course }: { course: Course }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "leaving">("idle");
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    setStep("leaving");
    setError(null);
    try {
      await api<Course>(`/courses/${course.id}/join`, { method: "DELETE" });
      router.push("/courses");
    } catch (e) {
      setError((e as Error).message);
      setStep("confirm");
    }
  }

  const button = "inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold disabled:opacity-50";

  return (
    <section className="mt-8 flex flex-col gap-3 border-t border-line pt-6">
      {step === "idle" ? (
        <button
          onClick={() => setStep("confirm")}
          className={`${button} self-start border border-field bg-white text-muted hover:border-ink hover:text-ink`}
        >
          Leave {course.code}
        </button>
      ) : (
        <div role="group" aria-labelledby="leave-question" className="flex flex-col gap-3 rounded-xl border border-line bg-white p-4">
          <p id="leave-question" className="text-sm">
            <span className="font-semibold">Leave {course.code}?</span>{" "}
            <span className="text-muted">
              You&apos;ll stop seeing these classmates and they&apos;ll stop seeing you. You can join again later.
            </span>
          </p>
          <div className="flex flex-wrap gap-2.5">
            <button onClick={leave} disabled={step === "leaving"} className={`${button} bg-husky text-white hover:bg-husky-deep`}>
              {step === "leaving" ? "Leaving…" : `Leave ${course.code}`}
            </button>
            <button
              onClick={() => { setStep("idle"); setError(null); }}
              disabled={step === "leaving"}
              autoFocus
              className={`${button} border border-field bg-white text-ink`}
            >
              Cancel
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-[#8a1c1c]">{error}</p>}
        </div>
      )}
    </section>
  );
}
