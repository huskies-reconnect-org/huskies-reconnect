// Development-only preview of the ported cards in every state (404 in production).
// Uses the fictional demo students from apps/api/app/demo_seed.py; nothing here is real data.
import { notFound } from "next/navigation";
import { Button, ClassmateCard, Container, IntroCard, MonoLabel } from "@/components/ui";

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
    <main className="flex-auto">
      <Container className="flex flex-col gap-10 py-10">
        <div>
          <MonoLabel>Development only</MonoLabel>
          <h1 className="voice-casual mt-1 text-display-sm font-extrabold">Ported card states</h1>
        </div>

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
  );
}
