"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { api, type Me, type ProfileIn, type ProfileOut } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";

const EMPTY: ProfileIn = { full_name: "", major: "", grad_year: null, interests: "", goals: "" };

export default function ProfilePage() {
  const session = useRequireSession();
  const [form, setForm] = useState<ProfileIn>(EMPTY);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "warn" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Me>("/me")
      .then((me) => {
        setForm({
          full_name: me.full_name ?? "",
          major: me.major ?? "",
          grad_year: me.grad_year,
          interests: me.interests ?? "",
          goals: me.goals ?? "",
        });
        setLoaded(true);
      })
      .catch((e: Error) => setNotice({ kind: "error", text: e.message }));
  }, [session]);

  function set<K extends keyof ProfileIn>(key: K, value: ProfileIn[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const out = await api<ProfileOut>("/me/profile", { method: "PUT", body: JSON.stringify(form) });
      setNotice(
        out.embedding_status === "failed"
          ? { kind: "warn", text: "Profile saved, but we couldn't update your matches right now. Save again in a minute." }
          : { kind: "ok", text: "Profile saved." },
      );
    } catch (err) {
      setNotice({ kind: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  const input = "rounded-lg border border-field bg-white px-3.5 py-3 text-base font-normal text-ink";
  const label = "flex flex-col gap-2 text-sm font-semibold";
  const noticeStyle = {
    ok: "border-[#bfe0c9] bg-[#edf7f0] text-[#1f5a35]",
    warn: "border-[#ead9a6] bg-[#fdf6e3] text-[#4a3c0b]",
    error: "border-[#ead9a6] bg-[#fdf6e3] text-[#4a3c0b]",
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6">
      <Link href="/" className="self-start text-sm font-medium text-husky-deep hover:underline">← Home</Link>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-[38px]">Your profile</h1>
        <p className="text-muted">
          Classmates are matched on your major, interests and goals. Be specific: &quot;NLP and climbing&quot; matches better than &quot;tech&quot;.
        </p>
      </header>

      {!loaded && !notice && (
        <div className="h-[520px] animate-pulse rounded-2xl border border-line bg-white" aria-hidden="true" />
      )}
      {!loaded && !notice && <p role="status" className="-mt-3 text-sm text-muted">Loading…</p>}

      {loaded && (
        <form onSubmit={save} className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 sm:p-7">
          <label className={label}>
            Name
            <input className={input} required maxLength={100} value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)} />
          </label>
          <div className="flex flex-wrap gap-4">
            <label className={`${label} flex-[1_1_260px]`}>
              Major / program
              <input className={input} required maxLength={100} placeholder="MS Computer Science"
                value={form.major} onChange={(e) => set("major", e.target.value)} />
            </label>
            <label className={`${label} flex-[0_1_140px]`}>
              Grad year
              <input className={input} type="number" min={2020} max={2035}
                value={form.grad_year ?? ""}
                onChange={(e) => set("grad_year", e.target.value ? Number(e.target.value) : null)} />
            </label>
          </div>
          <label className={label}>
            Interests
            <textarea className={input} required maxLength={500} rows={3}
              placeholder="NLP, rock climbing, building developer tools"
              value={form.interests} onChange={(e) => set("interests", e.target.value)} />
            <span className="flex justify-between text-xs font-normal text-muted">
              <span>Separate interests with commas. They show as tags on your card.</span>
              <span>{form.interests.length}/500</span>
            </span>
          </label>
          <label className={label}>
            Goals this semester
            <textarea className={input} required maxLength={500} rows={3}
              placeholder="Find a study group, meet people for a side project"
              value={form.goals} onChange={(e) => set("goals", e.target.value)} />
            <span className="text-right text-xs font-normal text-muted">{form.goals.length}/500</span>
          </label>
          <div className="flex flex-wrap items-center gap-3 border-t border-sand pt-5">
            <button
              disabled={saving}
              className="rounded-lg bg-husky px-5 py-3 font-semibold text-white hover:bg-husky-deep disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
            <span className="text-[13px] text-muted">Saving updates your matches in every course.</span>
          </div>
        </form>
      )}

      {notice && (
        <p role="status" className={`rounded-xl border px-4 py-3 text-sm ${noticeStyle[notice.kind]}`}>{notice.text}</p>
      )}
    </main>
  );
}
