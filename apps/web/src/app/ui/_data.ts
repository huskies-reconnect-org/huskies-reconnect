// Example data for the /ui reference page ONLY.
// Never import this from a product route. Real screens read real data; see docs/ui/rules.md.

import type { SafetyState, SharedReason } from "@/components/ui";

export type ExampleCard = {
  name: string;
  program: string;
  courseCode: string;
  context?: string;
  reasons: SharedReason[];
  intro: string;
  safety: SafetyState;
  safetyReason?: string;
};

export const exampleViewer = { name: "Jordan Lee", href: "/profile" };

export const exampleDeck: ExampleCard[] = [
  {
    name: "Maya Okafor",
    program: "Computer Science and Design · 3rd year",
    courseCode: "CS 3500",
    context: "Tuesday lab",
    reasons: [
      { text: "You're both applying for product design co-ops this spring.", highlight: "product design co-ops" },
      { text: "You're in the same Tuesday lab.", highlight: "Tuesday lab" },
      { text: "Maya listed rock climbing too.", highlight: "rock climbing" },
    ],
    intro:
      "Hi Maya, I'm Jordan from the Tuesday CS 3500 lab. Saw you're also applying for product design co-ops this spring. A few of us are swapping portfolio feedback before applications open next month. Want in?",
    safety: "passed",
  },
  {
    name: "Daniel Reyes",
    program: "Data Science · 2nd year",
    courseCode: "CS 3500",
    context: "Thursday lab",
    reasons: [
      { text: "You both want to build something with MBTA data.", highlight: "MBTA data" },
      { text: "You're in the same Thursday lab.", highlight: "Thursday lab" },
    ],
    intro:
      "Hi Daniel, I'm Jordan from CS 3500. You listed MBTA data as something you want to build with, and so did I. Want to compare ideas after lab on Thursday?",
    safety: "checking",
  },
  {
    name: "Priya Raman",
    program: "CS and Business Administration · 4th year",
    courseCode: "CS 3500",
    reasons: [
      { text: "Priya did a fintech co-op, which you listed as a goal.", highlight: "fintech co-op" },
      { text: "You're both in DS 3000 this term.", highlight: "DS 3000" },
    ],
    intro:
      "Hi Priya, I'm Jordan from CS 3500. I'm hoping to land a fintech co-op next cycle and saw you did one. Could I ask you a few questions about it? Text me at 617 555 0144.",
    safety: "held",
    safetyReason: "It includes a phone number. Share contact details after they reply.",
  },
  {
    name: "Jonah Weiss",
    program: "Computer Engineering · 3rd year",
    courseCode: "CS 3500",
    reasons: [
      { text: "You both listed music production.", highlight: "music production" },
      { text: "Jonah took CS 2510 with you last spring.", highlight: "CS 2510" },
    ],
    intro:
      "Hi Jonah, I'm Jordan, also in CS 3500. We were both in CS 2510 last spring too. Saw you're into music production. I've been learning Ableton and would love a pointer or two.",
    safety: "passed",
  },
];

export const exampleDecks = [
  { href: "/classmates/cs-3500", code: "CS 3500", title: "Object-Oriented Design", count: "4 cards", current: true },
  { href: "/classmates/ds-3000", code: "DS 3000", title: "Foundations of Data Science", count: "2 cards" },
  { href: "/classmates/engw-3302", code: "ENGW 3302", title: "Advanced Writing in the Technical Professions", count: "1 card" },
];

export const exampleCourses = [
  { code: "CS 3500", title: "Object-Oriented Design", details: "Section 01 · CRN 10234 · Tue and Fri 9:50", members: "41 classmates here", joined: true },
  { code: "CS 3500", title: "Object-Oriented Design", details: "Section 02 · CRN 10235 · Mon and Thu 1:35", members: "28 classmates here", joined: false },
  { code: "CS 3520", title: "Programming in C++", details: "Section 01 · CRN 11872 · Wed 6:00 pm", joined: false },
];

export const exampleInterests = [
  "Rock climbing",
  "Music production",
  "Product design",
  "Fintech",
  "Open source",
  "Transit data",
  "Startups",
  "Photography",
];
