import Link from "next/link";
import { AppHeader, CardStack, Container, IndexCard, Marker, MonoLabel, SiteFooter } from "@/components/ui";

const steps = [
  "Sign in with your Northeastern email.",
  "Join the courses you're taking this term.",
  "Flip through a few classmates worth meeting, and see why.",
  "Send only the intros you've read and approved.",
  "When the term ends, each class stays open as a class network.",
];

export default function Home() {
  return (
    <>
      <AppHeader />
      <main id="main" className="flex-auto">
        <Container className="flex flex-wrap items-start gap-x-14 gap-y-12 py-12 sm:py-16">
          <CardStack depth={2} className="max-w-xl flex-[1_1_22rem]">
            <IndexCard>
              <MonoLabel>For Northeastern students</MonoLabel>
              <h1 className="voice-casual mt-3 text-display-sm font-extrabold sm:text-display">
                Stay in touch with your classmates after the <Marker>semester ends</Marker>.
              </h1>
              <p className="mt-4 text-lead text-muted">
                Each week you get a short deck of people from your courses, the reasons you two might get
                along, and an intro you can edit before anything sends.
              </p>
            </IndexCard>
          </CardStack>

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
            {process.env.NODE_ENV === "development" ? (
              <p className="mt-8 text-small text-muted">
                Building a feature? The component reference is at{" "}
                <Link href="/ui" className="font-bold text-ink underline underline-offset-4">
                  /ui
                </Link>
                .
              </p>
            ) : null}
          </section>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
