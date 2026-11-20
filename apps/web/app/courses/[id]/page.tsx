"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type Course, type Match } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";
import { MatchCard } from "@/components/MatchCard";

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

  useEffect(() => {
    if (!session) return;
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
  }, [session, id]);

  if (!session) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">
          {course ? `${course.code} classmates` : "Classmates"}
        </h1>
        <Link href="/courses" className="text-sm underline">All courses</Link>
      </header>
      {course && <p className="-mt-4 text-sm text-gray-600">{course.title}</p>}

      {state.kind === "loading" && <p className="text-sm">Finding classmates…</p>}

      {state.kind === "needs-profile" && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          Add your interests and goals first. <Link href="/profile" className="underline">Complete your profile</Link>
        </p>
      )}

      {state.kind === "not-member" && (
        <p className="rounded border p-3 text-sm">
          Join this course to see classmates. <Link href="/courses" className="underline">Back to courses</Link>
        </p>
      )}

      {state.kind === "error" && <p role="alert" className="text-sm text-red-600">{state.message}</p>}

      {state.kind === "ready" && state.matches.length === 0 && (
        <p className="rounded border p-3 text-sm">
          No strong matches yet. As more classmates join and fill in their profiles, they&apos;ll show up here.
        </p>
      )}

      {state.kind === "ready" && state.matches.length > 0 && (
        <ul className="flex flex-col gap-3">
          {state.matches.map((m) => <MatchCard key={m.user_id} courseId={id} match={m} />)}
        </ul>
      )}
    </main>
  );
}
