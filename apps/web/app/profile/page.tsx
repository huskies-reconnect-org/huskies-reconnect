"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { api, type Me, type ProfileOut } from "@/lib/api";
import { useRequireSession } from "@/lib/useSession";
import { Avatar } from "@/components/Avatar";
import { PROFILE_UPDATED } from "@/components/NavBar";
import {
  AVATAR_COLOR_KEYS, AVATAR_COLORS, avatarColor, badgeIcon, badgeLabel, Icon, splitInterests, type AvatarColor,
} from "@/lib/avatar";

const MAX_INTERESTS_CHARS = 500; // API limit for the joined interests text

type Notice = { kind: "ok" | "warn" | "error"; text: string };

export default function ProfilePage() {
  const session = useRequireSession();
  const [loaded, setLoaded] = useState(false);
  const [fullName, setFullName] = useState("");
  const [major, setMajor] = useState("");
  const [gradYear, setGradYear] = useState<number | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [goals, setGoals] = useState("");
  const [color, setColor] = useState<AvatarColor>("blush");
  const [badge, setBadge] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!session) return;
    api<Me>("/me")
      .then((me) => {
        setFullName(me.full_name ?? "");
        setMajor(me.major ?? "");
        setGradYear(me.grad_year);
        setTags(splitInterests(me.interests));
        setGoals(me.goals ?? "");
        setColor(avatarColor(me.id, me.avatar_color));
        setBadge(me.avatar_badge ?? null);
        setLoaded(true);
      })
      .catch((e: Error) => setNotice({ kind: "error", text: e.message }));
  }, [session]);

  // A badge must be one of the current interests.
  const activeBadge = badge && tags.some((t) => t.toLowerCase() === badge.toLowerCase()) ? badge : null;

  function addTag(raw: string): string[] {
    const t = raw.trim().replace(/[,;]+$/, "").trim();
    if (!t || tags.some((x) => x.toLowerCase() === t.toLowerCase())) return tags;
    const next = [...tags, t];
    if (next.join(", ").length > MAX_INTERESTS_CHARS) {
      setNotice({ kind: "error", text: "That's a lot of interests. Remove one before adding more." });
      return tags;
    }
    setTags(next);
    return next;
  }

  function onTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && tags.length) {
      setTags(tags.slice(0, -1));
    }
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const allTags = draft.trim() ? addTag(draft) : tags;
    setDraft("");
    if (allTags.length === 0) {
      setNotice({ kind: "error", text: "Add at least one interest so we can find classmates for you." });
      return;
    }
    setSaving(true);
    setNotice(null);
    try {
      const out = await api<ProfileOut>("/me/profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: fullName, major, grad_year: gradYear, interests: allTags.join(", "), goals,
          avatar_color: color, avatar_badge: activeBadge,
        }),
      });
      window.dispatchEvent(new CustomEvent(PROFILE_UPDATED, { detail: out }));
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

  const field = "min-h-12 w-full rounded-xl border border-field bg-white px-4 py-3 text-base text-ink";
  const label = "text-[15px] font-semibold";
  const noticeStyle = {
    ok: "border-[#cde8d6] bg-[#e9f5ee] text-[#1f5a3a]",
    warn: "border-[#ead9a6] bg-[#fdf6e3] text-[#4a3c0b]",
    error: "border-[#f1c9d0] bg-blush text-husky-ink",
  };
  const noticeBox = notice && (
    <p role={notice.kind === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${noticeStyle[notice.kind]}`}>
      {notice.text}
    </p>
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-col gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center self-start text-[15px] font-medium text-husky-deep hover:underline">
          ← Back home
        </Link>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[44px]">Edit profile</h1>
        <p className="text-lg text-muted">This is how your classmates see you. Specific interests get you better matches.</p>
      </header>

      {!loaded && !notice && (
        <div aria-hidden="true" className="grid animate-pulse gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          <div className="h-96 rounded-[22px] border border-line bg-white" />
          <div className="h-[560px] rounded-[22px] border border-line bg-white" />
        </div>
      )}
      {!loaded && noticeBox}

      {loaded && (
        <form onSubmit={save} className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
          {/* Avatar */}
          <section className="hero-in flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6 sm:p-7">
            <h2 className="font-display text-xl font-semibold">Your avatar</h2>
            <div className="flex flex-col items-center gap-3 py-2">
              <Avatar id={session.user.id} name={fullName} color={color} badge={activeBadge} size="xl" />
              <p className="text-sm text-muted">
                {fullName || "Your name"}
                {activeBadge && <> · into {badgeLabel(activeBadge)}</>}
              </p>
            </div>

            <fieldset className="flex flex-col gap-3">
              <legend className={`${label} mb-3`}>Color</legend>
              <div role="radiogroup" aria-label="Avatar color" className="grid grid-cols-8 gap-1">
                {AVATAR_COLOR_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={color === k}
                    aria-label={AVATAR_COLORS[k].name}
                    onClick={() => setColor(k)}
                    className="flex aspect-square w-full items-center justify-center rounded-full"
                  >
                    <span
                      className={`h-[82%] w-[82%] rounded-full border transition-shadow ${
                        color === k ? "border-transparent ring-2 ring-ink ring-offset-2" : "border-black/5"
                      }`}
                      style={{ backgroundColor: AVATAR_COLORS[k].bg }}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-3">
              <legend className={label}>Badge</legend>
              <p className="-mt-1 text-sm text-muted">Picked from your interests. Shows on your avatar.</p>
              <div role="radiogroup" aria-label="Avatar badge" className="grid grid-cols-2 gap-2.5">
                {[...tags, null].map((t) => {
                  const selected = (t === null && !activeBadge) || (t !== null && activeBadge?.toLowerCase() === t.toLowerCase());
                  return (
                    <button
                      key={t ?? "none"}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setBadge(t)}
                      className={`flex min-h-14 items-center gap-2.5 rounded-xl bg-white px-3.5 py-2.5 text-left text-[15px] font-medium leading-tight ${
                        selected ? "border-2 border-ink" : "border border-line hover:border-field"
                      }`}
                    >
                      <Icon name={t === null ? "none" : badgeIcon(t)} className="h-[18px] w-[18px] shrink-0" />
                      {t === null ? "No badge" : badgeLabel(t)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>

          {/* About you */}
          <section className="hero-in flex flex-col gap-6 rounded-[22px] border border-line bg-white p-6 sm:p-8" style={{ animationDelay: "0.08s" }}>
            <h2 className="font-display text-xl font-semibold">About you</h2>

            <label className="flex flex-col gap-2">
              <span className={label}>Name</span>
              <input className={field} required maxLength={100} value={fullName}
                onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </label>

            <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_200px]">
              <label className="flex flex-col gap-2">
                <span className={label}>Major / program</span>
                <input className={field} required maxLength={100} placeholder="MS Computer Science"
                  value={major} onChange={(e) => setMajor(e.target.value)} />
              </label>
              <label className="flex flex-col gap-2">
                <span className={label}>Grad year</span>
                <input className={field} type="number" min={2020} max={2035} value={gradYear ?? ""}
                  onChange={(e) => setGradYear(e.target.value ? Number(e.target.value) : null)} />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="interest-input" className={label}>Interests</label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-field bg-white p-3 focus-within:border-ink">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-sand py-1 pl-3.5 pr-1 text-[15px]">
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      aria-label={`Remove ${t}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-stone hover:text-ink"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-2">
                        <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  id="interest-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onTagKey}
                  onBlur={() => { if (draft.trim()) { addTag(draft); setDraft(""); } }}
                  placeholder="Add an interest…"
                  maxLength={100}
                  className="min-h-11 min-w-[10rem] flex-1 bg-transparent px-1.5 text-base outline-none placeholder:text-muted"
                />
              </div>
              <p className="text-sm text-muted">Press Enter to add. &quot;NLP and climbing&quot; matches better than &quot;tech&quot;.</p>
            </div>

            <label className="flex flex-col gap-2">
              <span className={label}>Goals this semester</span>
              <textarea className={`${field} resize-y leading-relaxed`} required maxLength={500} rows={3}
                placeholder="Find a study group, meet people for a side project"
                value={goals} onChange={(e) => setGoals(e.target.value)} />
            </label>

            <div className="flex flex-col gap-4 border-t border-line pt-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <button disabled={saving}
                  className="min-h-12 rounded-xl bg-husky px-7 text-base font-semibold text-white hover:bg-husky-deep disabled:opacity-60">
                  {saving ? "Saving…" : "Save profile"}
                </button>
                <Link href="/" className="inline-flex min-h-11 items-center text-base font-semibold text-ink hover:underline">
                  Cancel
                </Link>
                <p className="text-sm text-muted sm:ml-auto">Saving updates your matches in every course.</p>
              </div>
              {noticeBox}
            </div>
          </section>
        </form>
      )}
    </main>
  );
}
