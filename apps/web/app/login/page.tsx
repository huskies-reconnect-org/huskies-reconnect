"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAllowedEmail, supabase } from "@/lib/supabase";

// Minimal login: email -> 6-digit code -> signed in.
// We use a typed code instead of a magic link because Microsoft 365 Safe Links
// (NU mail) pre-opens links and uses them up before the student clicks.
// The frontend team will restyle this page.
export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    // UX only: the Supabase auth hook is what actually enforces this.
    if (!isAllowedEmail(normalized)) {
      setError("Use your @northeastern.edu email.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEmail(normalized);
    setStep("code");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in to Huskies Reconnect</h1>

      {step === "email" ? (
        <form onSubmit={sendCode} className="flex flex-col gap-3">
          <label htmlFor="email" className="text-sm">Northeastern email</label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@northeastern.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <button disabled={busy} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
            {busy ? "Sending…" : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="flex flex-col gap-3">
          <p className="text-sm">We emailed a code to <strong>{email}</strong>.</p>
          <label htmlFor="code" className="text-sm">Code</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            pattern="[0-9]{6,10}"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="rounded border px-3 py-2 tracking-widest"
          />
          <button disabled={busy} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
            {busy ? "Checking…" : "Sign in"}
          </button>
          <button
            type="button"
            onClick={() => { setStep("email"); setCode(""); setError(null); }}
            className="text-sm underline"
          >
            Use a different email
          </button>
        </form>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
