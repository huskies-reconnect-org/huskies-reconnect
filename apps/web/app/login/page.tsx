"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAllowedEmail, supabase } from "@/lib/supabase";
import { CodeInput } from "@/components/CodeInput";
import { LoginHero } from "@/components/LoginHero";
import { MotionQuote } from "@/components/MotionQuote";

// Email -> 6-digit code -> signed in.
// We use a typed code instead of a magic link because Microsoft 365 Safe Links
// (NU mail) pre-opens links and uses them up before the student clicks.
const RESEND_AFTER_S = 60; // Supabase allows one code email per address per minute.

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentAt, setSentAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  // Tick once a second while the resend countdown is running.
  useEffect(() => {
    if (step !== "code") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [step]);
  const waitS = Math.max(0, RESEND_AFTER_S - Math.floor((now - sentAt) / 1000));

  async function requestCode(address: string): Promise<boolean> {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: address,
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return false;
    }
    setSentAt(Date.now());
    setNow(Date.now());
    return true;
  }

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = email.trim().toLowerCase();
    // UX only: the Supabase auth hook is what actually enforces this.
    if (!isAllowedEmail(normalized)) {
      setError("Use your @northeastern.edu email.");
      return;
    }
    if (!(await requestCode(normalized))) return;
    setEmail(normalized);
    setCode("");
    setInfo(null);
    setStep("code");
  }

  async function resend() {
    setError(null);
    setCode("");
    if (await requestCode(email)) setInfo("We sent a new code.");
  }

  async function verifyCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (code.length < 6) {
      setError("Enter all 6 digits from the email.");
      return;
    }
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

  const errorBox = error && (
    <p role="alert" className="rounded-xl border border-[#ead9a6] bg-[#fdf6e3] px-4 py-3 text-sm text-[#4a3c0b]">{error}</p>
  );

  if (step === "code") {
    return (
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <form
          onSubmit={verifyCode}
          className="hero-in flex w-full max-w-[460px] flex-col items-center gap-6 rounded-[22px] border border-line bg-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(26,26,26,0.07)] sm:px-9"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7 fill-none stroke-husky-deep stroke-2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="text-[15px] leading-relaxed text-muted">
              We sent a 6-digit code to
              <br />
              <strong className="font-semibold text-ink">{email}</strong>
            </p>
          </div>

          <CodeInput value={code} onChange={setCode} autoFocus disabled={busy} />

          <button
            disabled={busy}
            className="min-h-12 w-full rounded-xl bg-husky py-3.5 text-base font-semibold text-white hover:bg-husky-deep disabled:opacity-60"
          >
            {busy ? "Checking…" : "Verify and continue"}
          </button>

          <div className="-my-1 flex flex-col items-center">
            <p className="flex min-h-11 items-center gap-1.5 text-[15px] text-muted">
              Didn&apos;t get it?
              {waitS > 0 ? (
                <span className="font-semibold tabular-nums text-ink">
                  Resend in {Math.floor(waitS / 60)}:{String(waitS % 60).padStart(2, "0")}
                </span>
              ) : (
                <button type="button" onClick={resend} disabled={busy}
                  className="inline-flex min-h-11 items-center font-semibold text-husky-deep underline disabled:opacity-50">
                  Resend code
                </button>
              )}
            </p>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); setInfo(null); }}
              className="inline-flex min-h-11 items-center px-3 text-[15px] font-semibold text-husky-deep underline"
            >
              Use a different email
            </button>
          </div>

          {info && <p role="status" className="w-full rounded-xl bg-[#e9f5ee] px-4 py-3 text-sm text-[#1f5a3a]">{info}</p>}
          {errorBox && <div className="w-full text-left">{errorBox}</div>}
          <p className="w-full rounded-xl bg-cream px-4 py-3.5 text-left text-[15px] leading-relaxed text-muted">
            Using Outlook? The code can land in <strong className="font-semibold text-ink">Junk</strong> or{" "}
            <strong className="font-semibold text-ink">Other</strong>. Check there if it hasn&apos;t shown up.
          </p>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-wrap items-center gap-x-14 gap-y-12 overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
      <section className="flex min-w-0 flex-[1_1_560px] flex-col gap-6">
        <p className="hero-in text-sm font-semibold uppercase tracking-wider text-husky-deep">For Northeastern students</p>
        <h1 className="hero-in max-w-[640px] font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-[54px]"
          style={{ animationDelay: "0.08s" }}>
          Your classmates shouldn&apos;t vanish after finals.
        </h1>
        <p className="hero-in max-w-xl text-lg leading-relaxed text-muted" style={{ animationDelay: "0.16s" }}>
          We find the people in your courses you&apos;d actually click with, help you say hi, and keep your pack together after the semester ends.
        </p>

        <form onSubmit={sendCode} className="hero-in flex max-w-lg flex-col gap-2.5" style={{ animationDelay: "0.24s" }}>
          <label htmlFor="email" className="text-sm font-medium">Northeastern email</label>
          <div className="flex flex-wrap gap-2.5">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@northeastern.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 min-w-0 flex-[1_1_240px] rounded-xl border border-field bg-white px-4 py-3 text-base"
            />
            <button
              disabled={busy}
              className="min-h-12 rounded-xl bg-husky px-7 py-3 text-base font-semibold text-white hover:bg-husky-deep disabled:opacity-50"
            >
              {busy ? "Sending…" : "Get my code"}
            </button>
          </div>
          <p className="flex items-center gap-2 text-[13px] text-muted">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-muted stroke-2">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            6-digit code by email. Only @northeastern.edu, no passwords.
          </p>
          {errorBox}
        </form>

        <ol className="hero-in mt-1 flex flex-wrap gap-x-6 gap-y-3 text-[15px] text-[#3f3a36]" style={{ animationDelay: "0.32s" }}>
          {["Join your courses", "Meet your matches", "Say hi with a drafted intro"].map((t, i) => (
            <li key={t} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>

        <div className="hero-in mt-2 flex max-w-xl gap-3 border-t border-line pt-6" style={{ animationDelay: "0.4s" }}>
          <span aria-hidden="true" className="-mt-2 font-display text-5xl font-bold leading-none text-husky">&ldquo;</span>
          <MotionQuote className="min-w-0 flex-1" />
        </div>
      </section>

      <section className="flex min-w-0 flex-[1_1_400px] justify-center">
        <LoginHero />
      </section>
    </main>
  );
}
