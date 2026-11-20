"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Me } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useRequireSession } from "@/lib/useSession";

export default function Home() {
  const router = useRouter();
  const session = useRequireSession();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Me>("/me").then(setMe).catch((e: Error) => setError(e.message));
  }, [session]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!session) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Welcome{me?.full_name ? `, ${me.full_name}` : ""}</h1>
      <p className="text-sm text-gray-600">Signed in as {session.user.email}</p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {me && !me.profile_complete && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">
          Add your interests and goals so we can find classmates worth meeting.
        </p>
      )}
      <Link href="/profile" className="rounded border px-3 py-2 text-center">
        {me?.profile_complete ? "Edit profile" : "Complete your profile"}
      </Link>
      <Link href="/courses" className="rounded bg-black px-3 py-2 text-center text-white">Your courses</Link>
      <button onClick={signOut} className="rounded border px-3 py-2">Sign out</button>
    </main>
  );
}
