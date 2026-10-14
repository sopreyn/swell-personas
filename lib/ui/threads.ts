import type { ThreadGroup } from "./types";

/**
 * Sample sidebar history. Replace with sessions loaded from Supabase
 * (see lib/conversation for the record shape).
 */
export const SAMPLE_THREADS: ThreadGroup[] = [
  {
    day: "Today",
    items: [
      { title: "Missed deadline talk", personaId: "defensive", scenarioId: "deadline", summary: "Practiced holding the point" },
      { title: "Scope change pushback", personaId: "argumentative", scenarioId: "scope", summary: "Ended early" },
    ],
  },
  {
    day: "This week",
    items: [
      { title: "Rent conversation", personaId: "avoidant", scenarioId: "rent", summary: "Got to an actual plan" },
      { title: "Performance review", personaId: "argumentative", scenarioId: "review", summary: "3 rounds, stayed calm" },
      { title: "Credit for the deck", personaId: "defensive", scenarioId: "credit", summary: "Tension reached 4 of 5" },
    ],
  },
  {
    day: "Earlier",
    items: [
      { title: "Saying no to weekend work", personaId: "avoidant", scenarioId: "weekend", summary: "First session" },
    ],
  },
];
