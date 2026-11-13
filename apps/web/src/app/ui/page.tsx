import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  AppHeader,
  appNav,
  Button,
  ButtonLink,
  CardStack,
  Chip,
  ClassmateCard,
  ClassmateCardSkeleton,
  Container,
  CourseCode,
  DeckLink,
  DeckWaiting,
  EmptyState,
  IndexCard,
  IntroCard,
  Marker,
  Monogram,
  MonoLabel,
  Notice,
  PastClassCard,
  ProgressPips,
  SidebarLayout,
  SiteFooter,
  Skeleton,
  TextField,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DeckDemo } from "./_components/DeckDemo";
import { FormDemo } from "./_components/FormDemo";
import { CourseSearchDemo } from "./_components/CourseSearchDemo";
import { DialogDemo } from "./_components/DialogDemo";
import { exampleDeck, exampleDecks, exampleViewer } from "./_data";

export const metadata: Metadata = {
  title: "UI library",
  robots: { index: false, follow: false },
};

const swatches = [
  { token: "heather", hex: "#D3D3CF", use: "Page background, the table", swatch: "bg-heather" },
  { token: "heather-deep", hex: "#BDBDB8", use: "Dividers and dashed slots on the page", swatch: "bg-heather-deep" },
  { token: "card", hex: "#F7F6F1", use: "Index card surface", swatch: "bg-card" },
  { token: "card-edge", hex: "#E4E3DA", use: "Card under the stack, chips, skeletons", swatch: "bg-card-edge" },
  { token: "card-edge-deep", hex: "#B9B8AF", use: "Second card under the stack", swatch: "bg-card-edge-deep" },
  { token: "rule", hex: "#D8D4C8", use: "Ruled lines and dashed rules on cards", swatch: "bg-rule" },
  { token: "field", hex: "#FBFAF6", use: "Input fill", swatch: "bg-field" },
  { token: "ink", hex: "#1C1C1C", use: "Text, borders, header band", swatch: "bg-ink" },
  { token: "ink-raised", hex: "#2E2E2E", use: "Hover and raised areas on ink", swatch: "bg-ink-raised" },
  { token: "muted", hex: "#4A4B47", use: "Secondary text", swatch: "bg-muted" },
  { token: "on-ink", hex: "#F4F1EA", use: "Text on ink", swatch: "bg-on-ink" },
  { token: "red", hex: "#C8102E", use: "Primary fill, marker, selection, progress", swatch: "bg-red" },
  { token: "red-ink", hex: "#A50D26", use: "Red text and primary hover", swatch: "bg-red-ink" },
];

const typeScale = [
  { token: "text-display", size: "44px", voice: "voice-casual font-extrabold", sample: "Classmates to meet", cls: "text-display" },
  { token: "text-name", size: "40px", voice: "voice-casual font-extrabold", sample: "Maya Okafor", cls: "text-name" },
  { token: "text-display-sm", size: "34px", voice: "voice-casual font-extrabold", sample: "Phone page title", cls: "text-display-sm" },
  { token: "text-heading", size: "24px", voice: "voice-casual font-extrabold", sample: "Intro to Maya", cls: "text-heading" },
  { token: "text-note", size: "19px", voice: "voice-casual", sample: "You're in the same Tuesday lab.", cls: "text-note" },
  { token: "text-lead", size: "18px", voice: "voice-linear", sample: "Each week you get a short deck of people.", cls: "text-lead" },
  { token: "text-base", size: "16px", voice: "voice-linear", sample: "Interface text, buttons, form labels.", cls: "text-base" },
  { token: "text-small", size: "14px", voice: "voice-linear", sample: "Hints, meta, footnotes.", cls: "text-small" },
  { token: "text-label", size: "12px", voice: "voice-mono uppercase font-semibold", sample: "In common", cls: "text-label" },
];

const sections = [
  ["composition", "Dashboard"],
  ["tokens", "Color"],
  ["type", "Type"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["identity", "Labels and people"],
  ["cards", "Cards"],
  ["courses", "Course search"],
  ["feedback", "Feedback and loading"],
] as const;

function Section({ id, title, note, children }: { id: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t-2 border-heather-deep py-12">
      <Container>
        <h2 id={`${id}-title`} className="voice-casual text-heading font-extrabold">
          {title}
        </h2>
        {note ? <p className="mt-1.5 max-w-[68ch] text-muted">{note}</p> : null}
        <div className="mt-7">{children}</div>
      </Container>
    </section>
  );
}

function Demo({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <MonoLabel>{label}</MonoLabel>
      {children}
    </div>
  );
}

export default function UiLibraryPage() {
  const maya = exampleDeck[0];
  const daniel = exampleDeck[1];
  const priya = exampleDeck[2];

  return (
    <>
      <AppHeader nav={appNav} account={exampleViewer} />
      <main id="main" className="flex-auto">
        <Container className="py-10 sm:py-12">
          <MonoLabel>Developer reference · example data only</MonoLabel>
          <h1 className="voice-casual mt-2 text-display-sm font-extrabold sm:text-display">UI library</h1>
          <p className="mt-3 max-w-[68ch] text-lead text-muted">
            Every component in <CourseCode code="src/components/ui" />, in the states features need. Read{" "}
            <CourseCode code="docs/ui/rules.md" /> before building a screen. The people and courses on this
            page are made up for the reference and must never appear in a product route.
          </p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
            {sections.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className="rounded-full border-2 border-ink px-3.5 py-1 text-small font-semibold text-ink no-underline transition-colors hover:bg-ink hover:text-on-ink"
              >
                {label}
              </a>
            ))}
          </nav>
        </Container>

        <Section
          id="composition"
          title="Dashboard"
          note="The classmates screen, composed only from library components. One classmate per card. Show intro flips it. Not now sends the card to the back. Priya's intro is held by the safety check, so Send stays off."
        >
          <SidebarLayout
            sidebarLabel="Your decks"
            sidebar={
              <div className="flex flex-col gap-7">
                <div>
                  <MonoLabel as="h3">Your decks · Fall 2026</MonoLabel>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {exampleDecks.map((deck) => (
                      <li key={deck.href}>
                        <DeckLink {...deck} />
                      </li>
                    ))}
                    <li>
                      <DeckWaiting code="PHIL 1145" title="Technology and Human Values" joined={6} needed={10} />
                    </li>
                  </ul>
                </div>
                <form className="flex items-end gap-2">
                  <TextField label="Add a course" placeholder="Code or CRN" className="min-w-0 flex-auto" />
                  <Button variant="secondary" size="lg">
                    Find
                  </Button>
                </form>
                <div>
                  <MonoLabel as="h3">Past classes</MonoLabel>
                  <PastClassCard code="CS 2510" term="Spring 2026" href="/past-classes/cs-2510" linkLabel="See who is going" className="mt-3">
                    Three people from your lab start <Marker>Seattle co-ops</Marker> in January, same as you.
                  </PastClassCard>
                </div>
              </div>
            }
          >
            <MonoLabel>Deck · CS 3500 Object-Oriented Design</MonoLabel>
            <h3 className="voice-casual mt-1.5 text-display-sm font-extrabold sm:text-display">4 classmates worth meeting</h3>
            <p className="mt-1 text-muted">New cards every Monday.</p>
            <div className="mt-6">
              <DeckDemo />
            </div>
          </SidebarLayout>
        </Section>

        <Section
          id="tokens"
          title="Color"
          note="These are the only colors that compile. Tailwind's default palette is removed in globals.css. Red text always uses red-ink; plain red fails contrast on heather."
        >
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-3">
            {swatches.map((swatch) => (
              <li key={swatch.token} className="rounded-tile bg-card p-3">
                <span aria-hidden="true" className={cn("block h-14 rounded-tag border-2 border-ink/10", swatch.swatch)} />
                <p className="voice-mono mt-2 text-small font-semibold">{swatch.token}</p>
                <p className="text-small text-muted">
                  {swatch.hex} · {swatch.use}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="type"
          title="Type"
          note="One family, Recursive, in three voices. Casual for people and anything written to a person. Linear for interface. Mono for labels, codes and counts. One voice per element."
        >
          <div className="flex flex-col gap-4">
            <IndexCard className="flex flex-col gap-4">
              <p className="voice-casual text-name font-extrabold">voice-casual: Maya Okafor</p>
              <p className="voice-linear text-lead">voice-linear: Join the courses you&apos;re taking this term.</p>
              <p className="voice-mono text-lead font-semibold">voice-mono: CS 3500 · Card 1 of 4</p>
            </IndexCard>
            <ul className="divide-y-2 divide-dashed divide-heather-deep">
              {typeScale.map((row) => (
                <li key={row.token} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-3">
                  <span className="voice-mono w-40 text-small font-semibold text-muted">
                    {row.token} · {row.size}
                  </span>
                  <span className={cn(row.voice, row.cls)}>{row.sample}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section
          id="buttons"
          title="Buttons"
          note="Pills. One primary per view, for the action the screen exists for. Hover changes color only. Labels are verbs that say what happens."
        >
          <div className="flex flex-wrap gap-10">
            <Demo label="On heather">
              <div className="flex flex-wrap items-center gap-3">
                <Button>Send intro</Button>
                <Button variant="secondary">Edit intro</Button>
                <Button variant="quiet">Not now</Button>
                <Button disabled>Send intro</Button>
              </div>
            </Demo>
            <Demo label="Large, and as a link">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">Save profile</Button>
                <ButtonLink href="/courses" variant="secondary" size="lg">
                  Add a course
                </ButtonLink>
              </div>
            </Demo>
            <Demo label="On ink">
              <div className="flex flex-wrap items-center gap-3 rounded-card bg-ink p-5">
                <Button>Send intro</Button>
                <Button variant="inverse">Edit intro</Button>
              </div>
            </Demo>
          </div>
        </Section>

        <Section
          id="forms"
          title="Forms"
          note="Visible labels always. Placeholders show an example, never the label. Errors say what to do. Inputs are 48px tall with a 2px ink border."
        >
          <FormDemo />
        </Section>

        <Section id="identity" title="Labels and people" note="Monograms are the only avatar. Marker underlines the shared thing, never a whole sentence.">
          <div className="flex flex-wrap gap-10">
            <Demo label="Monogram">
              <div className="flex items-center gap-3">
                <Monogram name="Maya Okafor" size="lg" />
                <Monogram name="Daniel Reyes" />
                <Monogram name="Priya Raman" size="sm" />
                <span className="rounded-full bg-ink p-2">
                  <Monogram name="Jordan Lee" tone="card" />
                </span>
              </div>
            </Demo>
            <Demo label="Marker">
              <p className="voice-casual max-w-sm text-note">
                You&apos;re both applying for <Marker>product design co-ops</Marker> this spring.
              </p>
            </Demo>
            <Demo label="Chip">
              <div className="flex flex-wrap gap-2 rounded-card bg-card p-4">
                <Chip>Rock climbing</Chip>
                <Chip>Tuesday lab</Chip>
                <Chip>Spring 2026</Chip>
              </div>
            </Demo>
            <Demo label="MonoLabel and CourseCode">
              <div className="flex flex-col gap-1">
                <MonoLabel>In common</MonoLabel>
                <CourseCode code="ENGW 3302" />
              </div>
            </Demo>
            <Demo label="Progress">
              <ProgressPips current={2} total={4} />
            </Demo>
          </div>
        </Section>

        <Section
          id="cards"
          title="Cards"
          note="IndexCard is the surface. CardStack only where a real deck sits underneath. The back of every classmate card is an IntroCard, shown here in all three safety states."
        >
          <div className="flex flex-wrap items-stretch gap-8">
            <Demo label="ClassmateCard (front)" className="max-w-[31rem] flex-[1_1_20rem]">
              <ClassmateCard {...maya} headingLevel={3} className="min-h-[27rem]" />
            </Demo>
            <Demo label="IntroCard · passed" className="max-w-[31rem] flex-[1_1_20rem]">
              <IntroCard recipientName={maya.name} courseCode={maya.courseCode} body={maya.intro} safety="passed" headingLevel={3} />
            </Demo>
            <Demo label="IntroCard · checking" className="max-w-[31rem] flex-[1_1_20rem]">
              <IntroCard recipientName={daniel.name} courseCode={daniel.courseCode} body={daniel.intro} safety="checking" headingLevel={3} />
            </Demo>
            <Demo label="IntroCard · held" className="max-w-[31rem] flex-[1_1_20rem]">
              <IntroCard
                recipientName={priya.name}
                courseCode={priya.courseCode}
                body={priya.intro}
                safety="held"
                safetyReason={priya.safetyReason}
                headingLevel={3}
              />
            </Demo>
            <Demo label="CardStack with an IndexCard" className="max-w-[31rem] flex-[1_1_20rem]">
              <CardStack depth={2}>
                <IndexCard>
                  <p className="voice-casual text-note">Two more cards sit under this one.</p>
                </IndexCard>
              </CardStack>
            </Demo>
          </div>
        </Section>

        <Section id="courses" title="Course search" note="Search by code or CRN. Each result is a section with its own Join. Joined replaces the button.">
          <CourseSearchDemo />
        </Section>

        <Section
          id="feedback"
          title="Feedback and loading"
          note="Notices for what just happened. Empty slots always point to the next step. Skeletons take the shape of what is loading. One modal shell, solid scrim."
        >
          <div className="flex flex-wrap items-start gap-8">
            <div className="flex max-w-md flex-[1_1_20rem] flex-col gap-3">
              <MonoLabel>Notice</MonoLabel>
              <Notice tone="success" title="Intro sent">
                Maya gets it now. Replies show up in Classmates.
              </Notice>
              <Notice title="Cards refresh Monday">You&apos;ve seen everyone in this week&apos;s CS 3500 deck.</Notice>
              <Notice tone="error" title="Couldn't join CS 3500">
                The course list didn&apos;t load. Check your connection and try again.
              </Notice>
            </div>
            <Demo label="EmptyState" className="max-w-md flex-[1_1_20rem]">
              <EmptyState title="No courses yet" headingLevel={3} action={<ButtonLink href="/courses">Add a course</ButtonLink>}>
                Join the courses you&apos;re taking and your first deck shows up the next Monday.
              </EmptyState>
            </Demo>
            <Demo label="Skeletons" className="max-w-[31rem] flex-[1_1_20rem]">
              <ClassmateCardSkeleton />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Demo>
            <Demo label="Dialog">
              <DialogDemo />
            </Demo>
          </div>
        </Section>
      </main>
      <SiteFooter links={[{ href: "/", label: "Home" }]} />
    </>
  );
}
