"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isAllowedEmail, supabase } from "@/lib/supabase";
import { PawIcon, Wordmark } from "@/components/PawLogo";
import { ReconnectMotif } from "@/components/ReconnectMotif";

// Minimal login: email -> 6-digit code -> signed in.
// We use a typed code instead of a magic link because Microsoft 365 Safe Links
// (NU mail) pre-opens links and uses them up before the student clicks.
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

  const errorBox = error && (
    <p role="alert" className="rounded-xl border border-[#ead9a6] bg-[#fdf6e3] px-4 py-3 text-sm text-[#4a3c0b]">{error}</p>
  );

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <header className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Wordmark />
      </header>

      {step === "email" ? (
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-wrap items-center gap-14 px-4 pb-16 pt-10 sm:px-6">
          <section className="flex min-w-0 flex-[1_1_440px] flex-col gap-6">
            <ReconnectMotif />
            <p className="text-sm font-semibold uppercase tracking-wider text-husky-deep">For Northeastern students</p>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-[54px]">
              Your classmates shouldn&apos;t vanish after finals.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted">
              Find the people in your courses worth knowing, get help saying hi, and keep the connection after the semester ends.
            </p>

            <form onSubmit={sendCode} className="flex max-w-lg flex-col gap-2.5">
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
                  className="min-w-0 flex-[1_1_240px] rounded-xl border border-field bg-white px-4 py-3.5 text-base"
                />
                <button
                  disabled={busy}
                  className="rounded-xl bg-husky px-6 py-3.5 text-base font-semibold text-white hover:bg-husky-deep disabled:opacity-50"
                >
                  {busy ? "Sending…" : "Send code"}
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

            <ol className="mt-1 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[#3f3a36]">
              {["Join your courses", "Meet your matches", "Say hi with a drafted intro"].map((t, i) => (
                <li key={t} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </section>

          {/* Static illustration of a match card (approved by the lead); not live data. */}
          <section aria-hidden="true" className="relative hidden h-[460px] min-w-0 flex-[1_1_400px] md:block">
            <PawIcon className="absolute left-0 top-4 h-16 w-16 -rotate-[20deg] fill-[#f1dcdf]" />
            <PawIcon className="absolute left-[70px] top-24 h-11 w-11 rotate-[10deg] fill-[#f1dcdf]" />
            <div className="absolute right-2 top-6 flex w-[320px] rotate-6 items-center gap-3 rounded-2xl border border-line bg-white p-5 opacity-85 shadow-[0_10px_30px_rgba(26,26,26,0.06)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f6e3cf] font-display font-bold text-[#7a4a1e]">DO</span>
              <div className="flex flex-col">
                <span className="font-semibold">Daniel Okafor</span>
                <span className="text-[13px] text-muted">Robotics · reinforcement learning</span>
              </div>
            </div>
            <div className="absolute left-10 top-28 flex w-[390px] max-w-[calc(100%-40px)] -rotate-3 flex-col gap-4 rounded-[22px] border border-line bg-white p-6 shadow-[0_24px_60px_rgba(26,26,26,0.14)]">
              <div className="flex items-center gap-3.5">
                <span className="flex h-13 w-13 items-center justify-center rounded-full bg-[#dce6f7] font-display text-lg font-bold text-[#23407a]">AH</span>
                <div className="flex flex-1 flex-col">
                  <span className="text-lg font-semibold">Aisha Hassan</span>
                  <span className="text-[13px] text-muted">CS5100 · MS Artificial Intelligence</span>
                </div>
                <span className="rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-husky-ink">Good match</span>
              </div>
              <p className="font-display text-lg font-semibold leading-snug">Co-write a paper on responsible AI and start a reading group on LLM safety</p>
              <p className="rounded-xl bg-cream px-4 py-3 text-sm leading-relaxed text-[#3f3a36]">
                &ldquo;Hi Aisha! I&apos;m also in CS5100. Want to start that LLM safety reading group together?&rdquo;
              </p>
            </div>
            <div className="absolute right-6 top-[390px] flex rotate-2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-[0_10px_24px_rgba(26,26,26,0.2)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-[#7fd49b] stroke-[2.2]">
                <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Intro drafted and safety-checked
            </div>
          </section>
        </main>
      ) : (
        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-10">
          <form
            onSubmit={verifyCode}
            className="flex w-full max-w-[460px] flex-col items-center gap-6 rounded-[22px] border border-line bg-white px-6 py-10 text-center shadow-[0_16px_48px_rgba(26,26,26,0.07)] sm:px-9"
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
                We emailed a code to <strong className="font-semibold text-ink">{email}</strong>.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 text-left">
              <label htmlFor="code" className="text-sm font-medium">Code</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6,10}"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-field bg-white px-4 py-3.5 text-center font-display text-2xl font-semibold tracking-[0.4em]"
              />
            </div>
            <button
              disabled={busy}
              className="w-full rounded-xl bg-husky py-3.5 text-base font-semibold text-white hover:bg-husky-deep disabled:opacity-50"
            >
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-husky-deep underline"
            >
              Use a different email
            </button>
            {errorBox && <div className="w-full text-left">{errorBox}</div>}
            <p className="w-full rounded-xl bg-cream px-4 py-3 text-left text-[13px] leading-relaxed text-muted">
              Using Outlook? The code can land in <strong className="font-semibold text-ink">Junk</strong> or{" "}
              <strong className="font-semibold text-ink">Other</strong>.
            </p>
          </form>
        </main>
      )}
    </div>
  );
}
