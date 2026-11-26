"use client";

// Landing page layout from Shaad Qureshi's UI library (PR #2), with copy rewritten to
// describe what this app does. Public for everyone; the call to action depends on
// whether you're signed in.
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Me } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { SiteHeader } from "@/components/SiteHeader";
import { ButtonLink, CardStack, Container, IndexCard, Marker, MonoLabel, Notice, SiteFooter } from "@/components/ui";

const steps = [
  "Sign in with your Northeastern email.",
  "Add your interests and what you want out of this semester.",
  "Join the courses you're taking.",
  "See the classmates you have the most in common with.",
  "Get a short intro drafted for you, checked for tone and privacy. You send it yourself.",
  "When the semester ends, the course stays open so you can reconnect.",
];

export default function Home() {
  // null while we check; then true / false.
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    api<Me>("/me").then(setMe).catch(() => setMe(null));
  }, [signedIn]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-auto">
        <Container className="flex flex-wrap items-start gap-x-14 gap-y-12 py-12 sm:py-16">
          <div className="flex max-w-xl flex-[1_1_22rem] flex-col gap-6">
            <CardStack depth={2}>
              <IndexCard>
                <MonoLabel>For Northeastern students</MonoLabel>
                <h1 className="voice-casual mt-3 text-display-sm font-extrabold sm:text-display">
                  Stay in touch with your classmates after the <Marker>semester ends</Marker>.
                </h1>
                <p className="mt-4 text-lead text-muted">
                  Find the people in your courses you have the most in common with, get a short intro
                  drafted for you, and reconnect with them after the course is over.
                </p>
              </IndexCard>
            </CardStack>

            {signedIn === false ? (
              <div>
                <ButtonLink href="/login" size="lg">Sign in</ButtonLink>
              </div>
            ) : null}

            {signedIn ? (
              <div className="flex flex-col gap-4">
                {me && !me.profile_complete ? (
                  <Notice title="Add your interests and goals">
                    That&apos;s how we find classmates worth meeting.{" "}
                    <Link href="/profile" className="font-bold underline underline-offset-4">Complete your profile</Link>
                  </Notice>
                ) : null}
                <div>
                  <ButtonLink href="/courses" size="lg">Your courses</ButtonLink>
                </div>
              </div>
            ) : null}
          </div>

          <section aria-labelledby="how-it-works" className="flex-[1_1_18rem]">
            <MonoLabel as="h2" id="how-it-works">
              How it works
            </MonoLabel>
            <ol className="mt-3 flex list-decimal flex-col gap-3 pl-6 text-lead marker:font-bold marker:text-red-ink">
              {steps.map((step) => (
                <li key={step} className="pl-1">
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
