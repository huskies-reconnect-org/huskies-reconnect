// Development-only preview of the ported cards in every state (404 in production).
// Uses the fictional demo students from apps/api/app/demo_seed.py; nothing here is real data.
import { notFound } from "next/navigation";
import { AppHeader, Button, ClassmateCard, Container, IntroCard, MonoLabel, Notice, SiteFooter } from "@/components/ui";

export const metadata = { title: "UI preview | Huskies Reconnect" };

const maya = {
  name: "Maya Patel",
  program: "MS Computer Science · Class of 2027",
  details: [
    { label: "Interests", text: "Natural language processing, evaluating large language models, contributing to open-source ML libraries" },
    { label: "Goals", text: "Join an NLP research group and start a study group for CS6120" },
  ],
};
const daniel = {
  name: "Daniel Okafor",
  program: "MS Artificial Intelligence · Class of 2027",
  details: [
    { label: "Interests", text: "Reinforcement learning, robotics, building and flying drones" },
    { label: "Goals", text: "Land a robotics co-op and find a partner for an RL course project" },
  ],
};
const intro =
  "Hi Maya, it's Alex from CS5100. We're both into evaluating language models, and I'd love to compare notes on the NLP side of the course. Want to grab coffee at Snell after Thursday's lecture?";

export default function UiPreview() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <>
    <AppHeader
      nav={[{ href: "/courses", label: "Courses" }, { href: "/profile", label: "Profile" }]}
      action={<Button variant="inverse">Sign out</Button>}
    />
    <main className="flex-auto">
      <Container className="flex flex-col gap-10 py-10">
        <div>
          <MonoLabel>Development only</MonoLabel>
          <h1 className="voice-casual mt-1 text-display-sm font-extrabold">Ported card states</h1>
        </div>

        {/* Mirrors the signed-in course page (app/courses/[id]) so its layout can be checked without signing in. */}
        <section id="course-page" className="flex flex-col gap-6">
          <div>
            <span className="text-small text-muted underline underline-offset-4">All courses</span>
            <MonoLabel className="mt-4">CS5100</MonoLabel>
            <p className="voice-casual mt-1 text-display-sm font-extrabold sm:text-display">Foundations of Artificial Intelligence</p>
          </div>
          <Notice title="The semester has ended">
            This is now your <strong>CS5100 alumni group</strong>: the classmates you shared it with,
            ready when you want to reconnect.
          </Notice>
          <div className="flex flex-wrap items-center gap-3 rounded-field border-2 border-dashed border-heather-deep p-3">
            <MonoLabel>Demo controls</MonoLabel>
            <Button variant="secondary">Simulate semester end</Button>
          </div>
          <ul className="grid items-start gap-6 md:grid-cols-2">
            <li className="flex flex-col gap-3">
              <ClassmateCard {...maya} courseCode="CS5100" context="Demo profile" strength={{ label: "Strong match", tone: "strong" }} />
              <IntroCard
                recipientName="Maya Patel"
                courseCode="CS5100"
                safety="passed"
                body={intro}
                actions={<><Button variant="secondary">Copy</Button><Button variant="quiet">Regenerate</Button></>}
              />
            </li>
            <li className="flex flex-col gap-3">
              <ClassmateCard {...daniel} courseCode="CS5100" context="Demo profile" strength={{ label: "Possible match", tone: "possible" }}>
                <div className="flex flex-col items-start gap-2">
                  <Notice tone="error" title="No intro this time" className="w-full">
                    The AI is busy right now. Try again in 33 seconds.
                  </Notice>
                  <Button variant="secondary">Retry</Button>
                </div>
              </ClassmateCard>
            </li>
          </ul>
        </section>

        <section className="grid items-start gap-6 md:grid-cols-3">
          <ClassmateCard {...maya} courseCode="CS5100" context="Demo profile" strength={{ label: "Strong match", tone: "strong" }}>
            <Button variant="secondary">Draft intro</Button>
          </ClassmateCard>
          <ClassmateCard {...daniel} courseCode="CS5100" strength={{ label: "Good match", tone: "good" }} />
          <ClassmateCard {...maya} courseCode="CS5100" strength={{ label: "Possible match", tone: "possible" }} />
        </section>

        <section className="grid items-start gap-6 md:grid-cols-3">
          <IntroCard recipientName="Maya Patel" courseCode="CS5100" safety="checking" />
          <IntroCard
            recipientName="Maya Patel"
            courseCode="CS5100"
            safety="passed"
            body={intro}
            actions={<><Button variant="secondary">Copy</Button><Button variant="quiet">Regenerate</Button></>}
          />
          <IntroCard
            recipientName="Maya Patel"
            courseCode="CS5100"
            safety="held"
            safetyReason="Our safety check didn't pass the drafts for this pair."
            actions={<Button variant="secondary">Try again</Button>}
          />
        </section>
      </Container>
    </main>
    <SiteFooter />
    </>
  );
}
