"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type Course, type Match, type Me } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";
import { LeaveCourse } from "@/components/LeaveCourse";
import { MatchCard } from "@/components/MatchCard";
import { PawIcon, PawLoader } from "@/components/PawLogo";

type State =
  | { kind: "loading" }
  | { kind: "ready"; matches: Match[] }
  | { kind: "needs-profile" }
  | { kind: "not-member" }
  | { kind: "error"; message: string };

export default function CourseMatchesPage() {
  const { id } = useParams<{ id: string }>();
  const session = useRequireSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [state, setState] = useState<State>({ kind: "loading" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminBusy, setAdminBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!session) return;
    api<Me>("/me").then((me) => setIsAdmin(me.is_admin)).catch(() => {});
  }, [session]);

  async function changeSemester(action: "end" | "reset") {
    setAdminBusy(true);
    try {
      await api(`/courses/${id}/semester`, { method: "POST", body: JSON.stringify({ action }) });
      setReload((n) => n + 1);
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    } finally {
      setAdminBusy(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    setState({ kind: "loading" });
    api<Course[]>("/courses")
      .then((cs) => setCourse(cs.find((c) => c.id === id) ?? null))
      .catch(() => {});
    api<Match[]>(`/courses/${id}/matches`)
      .then((matches) => setState({ kind: "ready", matches }))
      .catch((e: Error) => {
        if (e instanceof ApiError && e.status === 409) setState({ kind: "needs-profile" });
        else if (e instanceof ApiError && e.status === 403) setState({ kind: "not-member" });
        else setState({ kind: "error", message: e.message });
      });
  }, [session, id, reload]);

  if (!session) return null;

  const alumni = course?.membership === "alumni";

  const demoControls = isAdmin && course?.joined && (
    <div
      className={`flex items-center gap-3 self-start rounded-xl border border-dashed py-2.5 pl-4 pr-3 text-sm ${
        alumni ? "border-[#6b6560] text-[#d6d1cc]" : "border-field bg-white text-muted"
      }`}
    >
      <span>Demo controls</span>
      {alumni ? (
        <button
          disabled={adminBusy}
          onClick={() => changeSemester("reset")}
          className="inline-flex min-h-11 items-center rounded-lg bg-white px-3.5 font-semibold text-ink disabled:opacity-50"
        >
          Undo semester end
        </button>
      ) : (
        <button
          disabled={adminBusy}
          onClick={() => changeSemester("end")}
          className="inline-flex min-h-11 items-center rounded-lg bg-ink px-3.5 font-semibold text-white disabled:opacity-50"
        >
          Simulate semester end
        </button>
      )}
    </div>
  );

  return (
    <div className="flex-1">
      {alumni ? (
        <section className="bg-ink text-white">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-11 pt-7 sm:px-6">
            <Link href="/courses" className="inline-flex min-h-11 items-center self-start text-sm font-medium text-[#d6d1cc] hover:text-white">← All courses</Link>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="flex flex-wrap items-center gap-5">
                <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-2xl bg-husky">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-9 w-9 fill-none stroke-white stroke-[1.8]">
                    <path d="M22 10L12 5 2 10l10 5 10-5z" strokeLinejoin="round" />
                    <path d="M6 12v5c3 2 9 2 12 0v-5M22 10v5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="flex max-w-2xl flex-col gap-2">
                  <span className="text-[13px] font-semibold uppercase tracking-widest text-[#f2a7b3]">
                    Alumni group · semester ended
                  </span>
                  <h1 className="font-display text-4xl font-bold tracking-tight">
                    {course ? `${course.code} alumni` : "Alumni group"}
                  </h1>
                  <p className="text-base leading-relaxed text-[#d6d1cc]">
                    The semester has ended. This is now your <strong className="text-white">{course?.code} alumni group</strong>:
                    the classmates you shared it with, ready when you want to reconnect.
                  </p>
                </div>
              </div>
              {demoControls}
            </div>
          </div>
        </section>
      ) : (
        <header className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-8 sm:px-6">
          <Link href="/courses" className="inline-flex min-h-11 items-center self-start text-sm font-medium text-husky-deep hover:underline">← All courses</Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-2.5">
              {course && (
                <span className="self-start rounded-full bg-blush px-2.5 py-1 font-display text-sm font-bold text-husky-deep">
                  {course.code}
                </span>
              )}
              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {course ? course.title : "Classmates"}
              </h1>
              <p className="text-muted">Classmates worth meeting, based on your interests and goals.</p>
            </div>
            {demoControls}
          </div>
        </header>
      )}

      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-16 pt-7 sm:px-6">
        {state.kind === "loading" && (
          <div className="flex flex-col gap-4">
            {[0, 1].map((i) => (
              <div key={i} aria-hidden="true" className="flex animate-pulse flex-col gap-4 rounded-2xl border border-line bg-white p-6">
                <div className="flex items-center gap-4">
                  <span className="h-14 w-14 rounded-full bg-stone" />
                  <div className="flex flex-1 flex-col gap-2">
                    <span className="h-3.5 w-1/2 rounded bg-stone" />
                    <span className="h-3 w-1/3 rounded bg-sand" />
                  </div>
                </div>
                <span className="h-5 w-4/5 rounded bg-stone" />
                <div className="flex gap-2">
                  <span className="h-7 w-28 rounded-full bg-sand" />
                  <span className="h-7 w-20 rounded-full bg-sand" />
                </div>
              </div>
            ))}
            <p role="status" className="flex items-center gap-2 text-sm text-muted"><PawLoader /> Finding classmates…</p>
          </div>
        )}

        {state.kind === "needs-profile" && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-10 text-center">
            <p className="text-lg font-semibold">Add your interests and goals first.</p>
            <p className="max-w-sm text-sm text-muted">We match classmates on interests and goals, so we need yours before we can find anyone.</p>
            <Link href="/profile" className="mt-1 rounded-lg bg-husky px-4 py-3 text-sm font-semibold text-white hover:bg-husky-deep">
              Complete your profile
            </Link>
          </div>
        )}

        {state.kind === "not-member" && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-10 text-center">
            <p className="text-lg font-semibold">Join this course to see classmates.</p>
            <Link href="/courses" className="mt-1 rounded-lg border border-field bg-white px-4 py-3 text-sm font-semibold">
              Back to courses
            </Link>
          </div>
        )}

        {state.kind === "error" && (
          <p role="alert" className="rounded-xl border border-[#ead9a6] bg-[#fdf6e3] p-4 text-sm text-[#4a3c0b]">{state.message}</p>
        )}

        {state.kind === "ready" && state.matches.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-white px-6 py-10 text-center">
            <PawIcon className="h-10 w-10 fill-[#e3b5bd]" />
            <p className="max-w-md text-sm leading-relaxed text-muted">
              No strong matches yet. As more classmates join and fill in their profiles, they&apos;ll show up here.
            </p>
          </div>
        )}

        {state.kind === "ready" && state.matches.length > 0 && (
          <>
            {alumni && <h2 className="font-display text-xl font-semibold">Your {course?.code} pack</h2>}
            <ul className="flex flex-col gap-4">
              {state.matches.map((m) => <MatchCard key={`${m.user_id}-${course?.membership}`} courseId={id} match={m} />)}
            </ul>
          </>
        )}

        {course?.joined && state.kind !== "loading" && <LeaveCourse course={course} />}
      </main>
    </div>
  );
}
