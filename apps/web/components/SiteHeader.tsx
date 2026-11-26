"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader, Button, ButtonLink, type NavItem } from "@/components/ui";
import { supabase } from "@/lib/supabase";

const NAV: NavItem[] = [
  { href: "/courses", label: "Courses" },
  { href: "/profile", label: "Profile" },
];

/** AppHeader wired to the session: nav + Sign out when signed in, Sign in otherwise. */
export function SiteHeader() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <AppHeader
      nav={signedIn ? NAV : undefined}
      action={
        signedIn === null ? null : signedIn ? (
          <Button variant="inverse" onClick={signOut}>Sign out</Button>
        ) : (
          <ButtonLink href="/login" variant="inverse">Sign in</ButtonLink>
        )
      }
    />
  );
}
