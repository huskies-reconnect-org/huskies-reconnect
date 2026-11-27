"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Course } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";

export default function CoursesPage() {
  const session = useRequireSession();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Course[]>("/courses")
      .then(setCourses)
      .catch((e: Error) => setError(e.message));
  }, [session]);

  async function join(id: string) {
    setError(null);
    setJoining(id);
    try {
      const updated = await api<Course>(`/courses/${id}/join`, { method: "POST" });
      setCourses((cs) => cs?.map((c) => (c.id === id ? updated : c)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setJoining(null);
    }
  }

  if (!session) return null;

  const joined = courses?.filter((c) => c.joined) ?? [];
  const others = courses?.filter((c) => !c.joined) ?? [];

  return (
    <main className="mx-auto flex w-full flex-1 max-w-5xl flex-col gap-8 px-4 pb-16 pt-9 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Your Fall 2026 courses</h1>
        <p className="text-muted">Join the courses you&apos;re taking to find classmates worth meeting.</p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-[#ead9a6] bg-[#fdf6e3] p-4 text-sm text-[#4a3c0b]">{error}</p>
      )}

      {!courses && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-line bg-white" />
          ))}
        </div>
      )}
      {!courses && !error && <p role="status" className="-mt-4 text-sm text-muted">Loading courses…</p>}

      {joined.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">Joined</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {joined.map((c) => {
              const alumni = c.membership === "alumni";
              return (
                <li key={c.id}>
                  <Link
                    href={`/courses/${c.id}`}
                    className="flex h-full flex-col gap-3.5 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(26,26,26,0.07)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-blush px-2.5 py-1 font-display text-sm font-bold text-husky-deep">{c.code}</span>
                      <span className="text-[13px] text-muted">
                        {c.member_count} {c.member_count === 1 ? "student" : "students"} joined
                      </span>
                    </div>
                    <span className="text-lg font-semibold leading-snug">{c.title}</span>
                    <span
                      className={`mt-auto self-start rounded-lg px-3 py-1.5 text-sm font-semibold ${
                        alumni ? "bg-ink text-white" : "text-husky-deep"
                      }`}
                    >
                      {alumni ? "Alumni group →" : "See classmates →"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {others.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-xl font-semibold">{joined.length > 0 ? "Taking another course?" : "Pick your courses"}</h2>
          <ul className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white">
            {others.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-sand px-5 py-4 last:border-b-0">
                <span className="w-20 font-display text-sm font-bold">{c.code}</span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px]">{c.title}</span>
                  <span className="text-[13px] text-muted">
                    {c.member_count} {c.member_count === 1 ? "student" : "students"} joined
                  </span>
                </div>
                <button
                  onClick={() => join(c.id)}
                  disabled={joining !== null}
                  className="inline-flex min-h-11 items-center rounded-lg border border-field bg-white px-4 text-sm font-semibold hover:border-ink disabled:opacity-50"
                >
                  {joining === c.id ? "Joining…" : "Join"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
