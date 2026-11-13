import type { Metadata } from "next";
import { AppHeader, ButtonLink, CardStack, Container, IndexCard, MonoLabel, SiteFooter } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <AppHeader />
      <main id="main" className="flex-auto">
        <Container className="py-16">
          <CardStack depth={1} className="max-w-xl">
            <IndexCard>
              <MonoLabel>404</MonoLabel>
              <h1 className="voice-casual mt-3 text-display-sm font-extrabold">This page isn&apos;t in the deck.</h1>
              <p className="mt-3 text-lead text-muted">
                The link may be old, or the page moved. Check the address, or start again from the home page.
              </p>
              <ButtonLink href="/" className="mt-6">
                Go to the home page
              </ButtonLink>
            </IndexCard>
          </CardStack>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
