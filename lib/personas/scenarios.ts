import type { Scenario } from "./types";

// Placeholder scenarios, two per archetype, pending Swell's real scenario library.
// `opener` is the persona's first spoken lines, shown before the user says anything.
export interface PracticeScenario extends Scenario {
  personaId: string;
  opener: string[];
}

export const scenarios: PracticeScenario[] = [
  {
    id: "deadline",
    personaId: "defensive",
    title: "Missed deadline talk",
    setup: "Your teammate missed a shared deadline and it landed on you.",
    userRole: "the teammate who was affected by the missed deadline",
    opener: [
      "I mean, I hear you, but I was just trying to work with the timeline we had? I asked about it twice.",
      "If it was that critical someone should have flagged it earlier. Nobody told me it was this tight.",
    ],
  },
  {
    id: "credit",
    personaId: "defensive",
    title: "Credit for the deck",
    setup: "A coworker presented your slides as their own idea in the team meeting.",
    userRole: "the coworker whose slides were presented without credit",
    opener: [
      "I mean, I built on what we talked about as a team. I was just trying to keep the meeting moving.",
      "I didn't realize you'd feel some kind of ownership over it.",
    ],
  },
  {
    id: "scope",
    personaId: "argumentative",
    title: "Scope change pushback",
    setup: "Your manager is rewriting your project scope in the middle of a review.",
    userRole: "the team member whose project scope is being changed",
    opener: [
      "I'd push back on the idea that this is a big change. Two weeks earlier is a stretch, not a break.",
      "I don't think you've looked closely enough at the sequencing to say it can't work.",
    ],
  },
  {
    id: "review",
    personaId: "argumentative",
    title: "Performance review",
    setup: "Your manager rated you lower than you expected and disputes each example you bring up.",
    userRole: "the employee receiving a performance review",
    opener: [
      "That's not really true. Hitting your targets is the job, it isn't above the job.",
      "Walk me through what you think went beyond the baseline. I'll tell you where I disagree.",
    ],
  },
  {
    id: "rent",
    personaId: "avoidant",
    title: "Rent conversation",
    setup: "Your roommate has stopped responding after a conversation about money.",
    userRole: "the roommate who raised the money conversation",
    opener: ["It's fine.", "Really, it's fine. I don't want to make it a thing."],
  },
  {
    id: "weekend",
    personaId: "avoidant",
    title: "Saying no to weekend work",
    setup: "You told a friend you can't help them move this weekend, and they've gone quiet.",
    userRole: "the friend who said no to helping this weekend",
    opener: ["It's whatever, don't worry about it.", "I'll figure something out. Maybe."],
  },
];

export function getScenario(id: string): PracticeScenario | undefined {
  return scenarios.find((s) => s.id === id);
}

export function scenariosFor(personaId: string): PracticeScenario[] {
  return scenarios.filter((s) => s.personaId === personaId);
}
