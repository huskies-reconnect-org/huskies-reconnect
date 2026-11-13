"use client";

import { useState } from "react";
import {
  Button,
  CardStack,
  ClassmateCard,
  DeckActions,
  EmptyState,
  FlipCard,
  IntroCard,
  Notice,
  ProgressPips,
} from "@/components/ui";
import { exampleDeck, type ExampleCard } from "../_data";

/**
 * Reference composition of the classmates deck: FlipCard inside CardStack, driven by
 * DeckActions. Copy this wiring for the real dashboard; replace the local state with
 * API calls (feedback, send) and the example data with the matches query.
 */
export function DeckDemo() {
  const [deck, setDeck] = useState<ExampleCard[]>(exampleDeck);
  const [seen, setSeen] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(exampleDeck[0].intro);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const card = deck[0];
  const total = exampleDeck.length;

  function showNext(nextDeck: ExampleCard[]) {
    setDeck(nextDeck);
    setFlipped(false);
    setEditing(false);
    setDraft(nextDeck[0]?.intro ?? "");
    setSeen((value) => Math.min(total, value + 1));
  }

  function skip() {
    setSentTo(null);
    showNext([...deck.slice(1), deck[0]]);
  }

  function send() {
    setSentTo(card.name.split(" ")[0]);
    showNext(deck.slice(1));
  }

  function restart() {
    setDeck(exampleDeck);
    setSeen(1);
    setFlipped(false);
    setEditing(false);
    setDraft(exampleDeck[0].intro);
    setSentTo(null);
  }

  if (!card) {
    return (
      <div className="flex max-w-xl flex-col gap-4">
        {sentTo ? (
          <Notice tone="success" title="Intro sent">
            {sentTo} gets it now. Replies show up in Classmates.
          </Notice>
        ) : null}
        <EmptyState
          title="You're through this week's deck"
          action={
            <Button variant="secondary" onClick={restart}>
              Start the example again
            </Button>
          }
        >
          New cards arrive Monday. Joining another course adds a deck.
        </EmptyState>
      </div>
    );
  }

  const firstName = card.name.split(" ")[0];
  const remaining = deck.length - 1;

  return (
    <div className="flex flex-col gap-6">
      <ProgressPips current={Math.min(seen, total)} total={total} />
      <CardStack depth={remaining >= 2 ? 2 : remaining === 1 ? 1 : 0} className="w-full max-w-[31rem]">
        <FlipCard
          flipped={flipped}
          className="min-h-[27rem]"
          front={
            <ClassmateCard
              name={card.name}
              program={card.program}
              courseCode={card.courseCode}
              context={card.context}
              reasons={card.reasons}
              headingLevel={3}
            />
          }
          back={
            <IntroCard
              recipientName={card.name}
              courseCode={card.courseCode}
              body={draft}
              safety={card.safety}
              safetyReason={card.safetyReason}
              editing={editing}
              onBodyChange={setDraft}
              headingLevel={3}
            />
          }
        />
      </CardStack>
      <DeckActions
        side={flipped ? "back" : "front"}
        firstName={firstName}
        onSkip={skip}
        onFlip={() => {
          setFlipped((value) => !value);
          setEditing(false);
        }}
        onEdit={() => setEditing((value) => !value)}
        onSend={send}
        editing={editing}
        canSend={card.safety === "passed"}
        className="max-w-[46rem]"
      />
      {sentTo ? (
        <Notice tone="success" title="Intro sent" className="max-w-xl">
          {sentTo} gets it now. Replies show up in Classmates.
        </Notice>
      ) : null}
    </div>
  );
}
