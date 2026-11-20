"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type Course, type Match, type Me } from "@/lib/api";
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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">
          {course ? `${course.code} classmates` : "Classmates"}
        </h1>
        <Link href="/courses" className="text-sm underline">All courses</Link>
      </header>
      {course && <p className="-mt-4 text-sm text-gray-600">{course.title}</p>}

      {course?.membership === "alumni" && (
        <p className="rounded border border-purple-300 bg-purple-50 p-3 text-sm">
          The semester has ended. This is now your <strong>{course.code} alumni group</strong>: the classmates
          you shared it with, ready when you want to reconnect.
        </p>
      )}

      {isAdmin && course?.joined && (
        <div className="flex items-center gap-2 rounded border border-dashed p-3 text-sm">
          <span className="text-gray-600">Demo controls:</span>
          {course.membership === "alumni" ? (
            <button disabled={adminBusy} onClick={() => changeSemester("reset")}
              className="rounded border px-3 py-1 disabled:opacity-50">Undo semester end</button>
          ) : (
            <button disabled={adminBusy} onClick={() => changeSemester("end")}
              className="rounded bg-purple-700 px-3 py-1 text-white disabled:opacity-50">Simulate semester end</button>
          )}
        </div>
      )}

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
          {state.matches.map((m) => <MatchCard key={`${m.user_id}-${course?.membership}`} courseId={id} match={m} />)}
        </ul>
      )}
    </main>
  );
}
