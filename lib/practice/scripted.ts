import { clampTension } from "./types";

// Offline fallback used by /api/chat and /api/review when ANTHROPIC_API_KEY is not set.
// It keeps the Practice Room usable on a laptop with no keys, using the same
// keyword idea as the original mockup. Real conversations go through Claude.

interface Script {
  escalate: string[][];
  calm: string[][];
}

const SCRIPTS: Record<string, Script> = {
  deadline: {
    escalate: [
      ["Okay, but I think you're remembering that differently than I am."],
      [
        "See, this is what I mean. It always ends up being my fault somehow.",
        "I was just trying to juggle three other things that week and nobody counts those.",
      ],
      ["I don't know what you want me to say here. It's done. What's the point of picking at it?"],
    ],
    calm: [
      ["Okay... yeah. I probably should have said something sooner."],
      ["I think I got overwhelmed and just went quiet instead of asking for help."],
      ["Can we figure out a way I flag this earlier next time?"],
    ],
  },
  credit: {
    escalate: [
      ["Wow, okay, I guess I can't collaborate with you on anything then."],
      ["This feels like you're making something out of nothing.", "I was just trying to keep the meeting moving."],
      ["Fine. Next time I'll stay quiet and let you present everything yourself."],
    ],
    calm: [
      ["Oh, I didn't realize it landed that way. That's fair."],
      ["I should've credited you by name when I presented it."],
      ["Let's figure out how we split credit going forward."],
    ],
  },
  scope: {
    escalate: [
      ["That's not really true. The client already agreed to the new date."],
      [
        "You're reframing what I said. I never said it was easy, I said it was doable.",
        "Last month you made the same argument about the Q2 handoff and it worked out.",
      ],
      ["Fine. Show me one concrete reason it breaks. Otherwise we're done debating this."],
    ],
    calm: [
      ["Okay, that's a fair point on the sequencing. I hadn't weighed the review step."],
      ["Alright, I'll grant that. What would you cut to make two weeks real?"],
      ["Good. Let's take that to the client together instead of me announcing it."],
    ],
  },
  review: {
    escalate: [
      ["I'd push back on that. One strong quarter doesn't change the overall picture."],
      ["That example is a weaker version of what I actually asked for.", "You conceded the other point last time."],
      ["I'm not going to relitigate the rating. Bring me something concrete or we move on."],
    ],
    calm: [
      ["Okay, that example is stronger than I gave it credit for."],
      ["Fair. I can see how that read as above the baseline."],
      ["Let's revisit the rating in writing, with that point included."],
    ],
  },
  rent: {
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
  weekend: {
    escalate: [
      ["I said it's fine, really."],
      ["..."],
      ["I don't want to make this a whole thing."],
    ],
    calm: [
      ["Honestly, yeah, I was a little disappointed."],
      ["I think I just expected you'd be free since you usually are."],
      ["Thanks for checking in. Let's find another day."],
    ],
  },
};

const HOT_WORDS = [
  "always",
  "never",
  "whatever",
  "unbelievable",
  "seriously",
  "kidding",
  "don't care",
  "forget it",
  "ridiculous",
];
const CALM_WORDS = [
  "understand",
  "hear you",
  "i hear",
  "sorry",
  "appreciate",
  "let's",
  "valid",
  "makes sense",
  "i get",
  "no rush",
  "take your time",
];

export function keywordDelta(text: string): number {
  const t = text.toLowerCase();
  if (HOT_WORDS.some((w) => t.includes(w))) return 1;
  if (CALM_WORDS.some((w) => t.includes(w))) return -1;
  return 0;
}

export function scriptedReply(
  scenarioId: string,
  userText: string,
  previousTension: number,
  turn: number,
): { reply: string[]; tension: number; note: string } {
  const tension = clampTension(previousTension + keywordDelta(userText));
  const script = SCRIPTS[scenarioId];
  if (!script) {
    return { reply: ["Okay. Go on."], tension, note: "" };
  }
  const branch = tension >= 3 ? script.escalate : script.calm;
  const reply = branch[Math.min(Math.max(turn, 0), branch.length - 1)];
  return { reply, tension, note: "" };
}
