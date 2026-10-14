import type { Scenario } from "@/lib/personas/types";

/**
 * A practice scenario for one persona. Extends the base Scenario with the
 * persona's opening lines and scripted fallback replies. The fallbacks are used
 * only when ANTHROPIC_API_KEY is missing.
 *
 * PLACEHOLDER content. Replace with Swell's real scenarios.
 */
export interface PracticeScenario extends Scenario {
  personaId: string;
  opener: string[];
  escalate: string[][];
  calm: string[][];
}

export const practiceScenarios: PracticeScenario[] = [
  {
    id: "deadline",
    personaId: "defensive",
    title: "Missed deadline talk",
    setup: "Your teammate missed a shared deadline and it landed on you.",
    userRole: "the colleague who had to cover for the missed deadline and wants to talk about it",
    opener: [
      "I mean, I hear you, but I feel like the timeline was never really nailed down? I asked about it twice.",
      "If it was that critical someone should have flagged it earlier. I'm not a mind reader.",
    ],
    escalate: [
      ["Okay, but I think you're remembering that differently than I am."],
      ["See, this is what I mean. It always ends up being my fault somehow.", "I had three other things going on that week that nobody seems to count."],
      ["I don't know what you want me to say here. It's done. What's the point of picking at it?"],
    ],
    calm: [
      ["Okay... yeah. I probably should have said something sooner."],
      ["I think I got overwhelmed and just went quiet instead of asking for help."],
      ["Can we figure out a way I flag this earlier next time?"],
    ],
  },
  {
    id: "credit",
    personaId: "defensive",
    title: "Credit for the deck",
    setup: "A coworker presented your slides as their own idea in the team meeting.",
    userRole: "the coworker whose slides were presented without credit",
    opener: [
      "I mean, I built on what we talked about as a team. I didn't think it was just yours.",
      "I didn't realize you'd feel some kind of ownership over it.",
    ],
    escalate: [
      ["Wow, okay, I guess I can't collaborate with you on anything then."],
      ["This feels like you're making something out of nothing.", "I was trying to keep the meeting moving."],
      ["Fine. Next time I'll just stay quiet and let you present everything yourself."],
    ],
    calm: [
      ["Oh, I didn't realize it landed that way. That's fair."],
      ["I should've credited you by name when I presented it."],
      ["Let's figure out how we split credit going forward."],
    ],
  },
  {
    id: "scope",
    personaId: "argumentative",
    title: "Scope change pushback",
    setup: "Your manager is rewriting your project scope in the middle of a review.",
    userRole: "the employee whose project scope is being changed without discussion",
    opener: [
      "Right, so I've already looped in the client and told them we're moving it up two weeks. You'll make it work.",
      "Let's not get bogged down. What else is on the list?",
    ],
    escalate: [
      ["That's a detail. We'll sort it out in the build."],
      ["I've done this a hundred times. Trust me on the sequencing.", "Next thing."],
      ["Look, I'm not relitigating a decision I already made. Are we done here?"],
    ],
    calm: [
      ["Okay, what specifically is the concern with the timeline?"],
      ["Fair, let's actually walk through the sequencing together."],
      ["Good catch. Let's adjust the plan before I tell the client anything."],
    ],
  },
  {
    id: "review",
    personaId: "argumentative",
    title: "Performance review",
    setup: "Your manager is rushing through your performance review without pausing for input.",
    userRole: "the employee being reviewed who wants a real conversation",
    opener: [
      "Overall, solid quarter. A couple things to tighten up, but let's move on.",
      "We've got six more of these today, so keep it brief.",
    ],
    escalate: [
      ["I don't really have time to unpack every point right now."],
      ["I already wrote the summary. We can revisit next cycle."],
      ["I'm not trying to be dismissive, I just need to keep this on schedule."],
    ],
    calm: [
      ["Sure, go ahead, I've got a minute."],
      ["That's fair, let's actually go through that point."],
      ["Okay, noted. I'll make sure that's reflected before I file this."],
    ],
  },
  {
    id: "rent",
    personaId: "avoidant",
    title: "Rent conversation",
    setup: "Your roommate has stopped responding after a conversation about money.",
    userRole: "the roommate trying to reopen a conversation about rent",
    opener: ["It's fine.", "Really, it's fine. I don't want to make it a thing."],
    escalate: [
      ["I said it's fine."],
      ["...", "Can we talk about this later?"],
      ["I don't really know what you want from me right now."],
    ],
    calm: [
      ["...okay. I guess I am a little stressed about it."],
      ["I didn't want to admit money's been tight this month."],
      ["Yeah. Let's figure out a plan together."],
    ],
  },
  {
    id: "weekend",
    personaId: "avoidant",
    title: "Saying no to weekend work",
    setup: "You told a friend you can't help them move this weekend, and they've gone quiet.",
    userRole: "the friend who said no and wants to check in",
    opener: ["It's whatever, don't worry about it.", "I'll figure something out."],
    escalate: [["I said it's fine, really."], ["..."], ["I don't want to make this a whole thing."]],
    calm: [
      ["Honestly, yeah, I was a little disappointed."],
      ["I think I just expected you'd be free since you usually are."],
      ["Thanks for checking in. Let's find another day."],
    ],
  },
];

export function scenariosFor(personaId: string): PracticeScenario[] {
  return practiceScenarios.filter((s) => s.personaId === personaId);
}

export function getPracticeScenario(personaId: string, scenarioId: string): PracticeScenario | undefined {
  return practiceScenarios.find((s) => s.personaId === personaId && s.id === scenarioId);
}
