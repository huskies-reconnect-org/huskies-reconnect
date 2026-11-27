"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { api, type Me } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/Avatar";
import { Wordmark } from "@/components/PawLogo";

/** The profile page fires this after saving, so the avatar updates without a reload. */
export const PROFILE_UPDATED = "huskies:profile-updated";

function nameFromEmail(email: string | undefined): string {
  return (email ?? "").split("@")[0].split(/[._-]+/).filter(Boolean).join(" ");
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Read-only view of the session for the avatar; page-level guards still handle redirects.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Name and avatar look for the account button.
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return setMe(null);
    api<Me>("/me").then(setMe).catch(() => {});
    const onUpdate = (e: Event) => setMe((e as CustomEvent<Me>).detail);
    window.addEventListener(PROFILE_UPDATED, onUpdate);
    return () => window.removeEventListener(PROFILE_UPDATED, onUpdate);
  }, [userId]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (pathname === "/login" || !session) return null;

  const email = session.user.email;

  return (
    <nav className="border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="group inline-flex min-h-11 items-center text-ink">
          <Wordmark />
        </Link>
        <div className="flex flex-1 gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-lg px-3.5 text-[15px] ${
                  active ? "bg-sand font-semibold text-ink" : "font-medium text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-label="Account menu"
            className="flex rounded-full"
          >
            <Avatar id={session.user.id} name={me?.full_name || nameFromEmail(email)} color={me?.avatar_color} size="sm" />
          </button>
          {open && (
            <div
              role="menu"
              className="absolute right-0 top-[52px] z-20 flex w-60 flex-col rounded-2xl border border-line bg-white p-2 text-ink shadow-[0_12px_32px_rgba(26,26,26,0.12)]"
            >
              <p className="mb-1.5 truncate border-b border-sand px-3 pb-3 pt-2 text-sm text-muted">{email}</p>
              <Link role="menuitem" href="/profile" className="flex min-h-11 items-center rounded-lg px-3 text-[15px] hover:bg-sand">
                Edit profile
              </Link>
              <button
                role="menuitem"
                onClick={signOut}
                className="flex min-h-11 items-center rounded-lg px-3 text-left text-[15px] hover:bg-sand"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
