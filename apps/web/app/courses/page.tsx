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

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Your Fall 2026 courses</h1>
        <Link href="/" className="text-sm underline">Home</Link>
      </header>
      <p className="text-sm text-gray-600">Join the courses you&apos;re taking to find classmates worth meeting.</p>

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!courses && !error && <p className="text-sm">Loading courses…</p>}

      <ul className="flex flex-col gap-3">
        {courses?.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 rounded border p-4">
            <div>
              <p className="font-medium">{c.code} · {c.title}</p>
              <p className="text-sm text-gray-600">
                {c.member_count} {c.member_count === 1 ? "student" : "students"} joined
              </p>
            </div>
            {c.joined ? (
              <Link href={`/courses/${c.id}`} className="rounded bg-green-100 px-3 py-1 text-sm text-green-800">
                See classmates →
              </Link>
            ) : (
              <button
                onClick={() => join(c.id)}
                disabled={joining !== null}
                className="rounded bg-black px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                {joining === c.id ? "Joining…" : "Join"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
