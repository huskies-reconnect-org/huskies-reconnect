"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Me = { id: string; email: string; full_name: string | null; major: string | null; grad_year: number | null };

// Placeholder home: proves the session works end to end (Supabase -> FastAPI /me).
export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setSession(data.session);
    });
  }, [router]);

  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/me`, { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(`API /me returned ${r.status}`);
        setMe(await r.json());
      })
      .catch((e: Error) => setApiError(e.message));
  }, [session]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!session) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">You&apos;re signed in</h1>
      <p className="text-sm">Supabase session: {session.user.email}</p>
      {me && <pre className="rounded border p-3 text-xs">{JSON.stringify(me, null, 2)}</pre>}
      {apiError && <p role="alert" className="text-sm text-red-600">{apiError}</p>}
      <button onClick={signOut} className="rounded border px-3 py-2">Sign out</button>
    </main>
  );
}
