"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";

export default function Home() {
  const session = useRequireSession();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Me>("/me").then(setMe).catch((e: Error) => setError(e.message));
  }, [session]);

  if (!session) return null;

  const firstName = me?.full_name?.trim().split(/\s+/)[0];

  return (
    <main className="mx-auto flex w-full flex-1 max-w-5xl flex-col gap-8 px-4 pb-16 pt-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[38px]">
          Welcome{firstName ? ` back, ${firstName}` : ""}
        </h1>
        <p className="text-muted">Signed in as {session.user.email}</p>
      </header>

      {error && (
        <p role="alert" className="rounded-xl border border-[#ead9a6] bg-[#fdf6e3] p-4 text-sm text-[#4a3c0b]">{error}</p>
      )}

      {me && !me.profile_complete && (
        <p className="rounded-2xl border border-[#f1c9d0] bg-blush px-5 py-4 text-[15px] text-husky-ink">
          Add your interests and goals so we can find classmates worth meeting.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/courses"
          className="group flex flex-col gap-3 rounded-2xl bg-husky p-6 text-white transition-colors hover:bg-husky-deep"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-none stroke-white stroke-2">
            <path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" strokeLinejoin="round" />
            <path d="M9 7h6" strokeLinecap="round" />
          </svg>
          <span className="font-display text-2xl font-bold">Your courses</span>
          <span className="text-[15px] text-white/85">Join your classes and see the classmates worth meeting.</span>
          <span className="mt-auto pt-2 text-sm font-semibold">Open →</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_8px_24px_rgba(26,26,26,0.07)]"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 fill-none stroke-ink stroke-2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
          </svg>
          <span className="font-display text-2xl font-bold">
            {me?.profile_complete ? "Edit profile" : "Complete your profile"}
          </span>
          <span className="text-[15px] text-muted">Specific interests and goals get you better matches.</span>
          <span className="mt-auto pt-2 text-sm font-semibold text-husky-deep">Open →</span>
        </Link>
      </div>
    </main>
  );
}
