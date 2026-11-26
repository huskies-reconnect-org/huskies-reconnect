"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError, type Course, type Match, type Me } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";
import { MatchCard } from "@/components/MatchCard";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Container, MonoLabel, Notice, SiteFooter } from "@/components/ui";

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
    <>
      <SiteHeader />
      <main id="main" className="flex-auto">
        <Container className="flex flex-col gap-6 py-10 sm:py-12">
          <div>
            <Link href="/courses" className="text-small text-muted underline underline-offset-4 hover:text-red-ink">
              All courses
            </Link>
            <MonoLabel className="mt-4">{course ? course.code : "Course"}</MonoLabel>
            <h1 className="voice-casual mt-1 text-display-sm font-extrabold sm:text-display">
              {course ? course.title : "Classmates"}
            </h1>
          </div>

          {course?.membership === "alumni" && (
            <Notice title="The semester has ended">
              This is now your <strong>{course.code} alumni group</strong>: the classmates you shared it with,
              ready when you want to reconnect.
            </Notice>
          )}

          {isAdmin && course?.joined && (
            <div className="flex flex-wrap items-center gap-3 rounded-field border-2 border-dashed border-heather-deep p-3">
              <MonoLabel>Demo controls</MonoLabel>
              {course.membership === "alumni" ? (
                <Button variant="secondary" disabled={adminBusy} onClick={() => changeSemester("reset")}>
                  Undo semester end
                </Button>
              ) : (
                <Button variant="secondary" disabled={adminBusy} onClick={() => changeSemester("end")}>
                  Simulate semester end
                </Button>
              )}
            </div>
          )}

          {state.kind === "loading" && <p className="text-muted">Finding classmates…</p>}

          {state.kind === "needs-profile" && (
            <Notice title="Add your interests and goals first">
              <Link href="/profile" className="font-bold underline underline-offset-4">Complete your profile</Link>
            </Notice>
          )}

          {state.kind === "not-member" && (
            <Notice title="Join this course to see classmates">
              <Link href="/courses" className="font-bold underline underline-offset-4">Back to courses</Link>
            </Notice>
          )}

          {state.kind === "error" && <Notice tone="error" title="Something went wrong">{state.message}</Notice>}

          {state.kind === "ready" && state.matches.length === 0 && (
            <Notice title="No classmates to show yet">
              As more classmates join and fill in their profiles, they&apos;ll show up here.
            </Notice>
          )}

          {state.kind === "ready" && state.matches.length > 0 && (
            <ul className="grid items-start gap-6 md:grid-cols-2">
              {state.matches.map((m) => (
                <MatchCard key={`${m.user_id}-${course?.membership}`} courseId={id} courseCode={course?.code ?? ""} match={m} />
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
