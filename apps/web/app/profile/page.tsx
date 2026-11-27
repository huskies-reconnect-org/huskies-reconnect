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

  const input = "rounded border px-3 py-2";
  const noticeColor = { ok: "text-green-700", warn: "text-amber-700", error: "text-red-600" };

  return (
    <main className="mx-auto flex w-full flex-1 max-w-xl flex-col gap-6 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Your profile</h1>
        <Link href="/" className="text-sm underline">Home</Link>
      </header>
      <p className="text-sm text-gray-600">
        Classmates are matched on your major, interests and goals. Be specific: &quot;NLP and climbing&quot; matches better than &quot;tech&quot;.
      </p>

      {!loaded && !notice && <p className="text-sm">Loading…</p>}

      {loaded && (
        <form onSubmit={save} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Name
            <input className={input} required maxLength={100} value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)} />
          </label>
          <div className="flex gap-4">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Major / program
              <input className={input} required maxLength={100} placeholder="MS Computer Science"
                value={form.major} onChange={(e) => set("major", e.target.value)} />
            </label>
            <label className="flex w-32 flex-col gap-1 text-sm">
              Grad year
              <input className={input} type="number" min={2020} max={2035}
                value={form.grad_year ?? ""}
                onChange={(e) => set("grad_year", e.target.value ? Number(e.target.value) : null)} />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Interests
            <textarea className={input} required maxLength={500} rows={3}
              placeholder="NLP, rock climbing, building developer tools"
              value={form.interests} onChange={(e) => set("interests", e.target.value)} />
            <span className="text-xs text-gray-500">{form.interests.length}/500</span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Goals this semester
            <textarea className={input} required maxLength={500} rows={3}
              placeholder="Find a study group, meet people for a side project"
              value={form.goals} onChange={(e) => set("goals", e.target.value)} />
            <span className="text-xs text-gray-500">{form.goals.length}/500</span>
          </label>
          <button disabled={saving} className="rounded bg-black px-3 py-2 text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      )}

      {notice && <p role="status" className={`text-sm ${noticeColor[notice.kind]}`}>{notice.text}</p>}
    </main>
  );
}
