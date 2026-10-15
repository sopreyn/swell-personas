import { compileSystemPrompt } from "@/lib/personas/compile-system-prompt";
import type { Persona, Scenario } from "@/lib/personas/types";

interface ChatPromptInput {
  persona: Persona;
  // Absent when continuing a past conversation, whose original scenario isn't stored.
  scenario?: Scenario;
  userType: string;
  tension: number;
  // The persona's opening lines, already shown to the user before their first message.
  opener: string;
}

// Persona rules and scenario come from lib/personas; this adds the reply format,
// the tension score and how to react to the user's assigned personality type.
export function buildChatSystemPrompt({
  persona,
  scenario,
  userType,
  tension,
  opener,
}: ChatPromptInput): string {
  return [
    compileSystemPrompt(persona, scenario),
    `The person you are talking to has the personality type "${userType}", assigned by Swell's quizzes. Let your reactions to them reflect how someone with your personality would realistically interact with someone of that type. Do not mention the type or the quiz.`,
    opener
      ? `You already opened the scene with these lines, which the user has seen:\n${opener}`
      : "",
    [
      "This is a practice conversation to help the user get better at resolving conflict, so keep it realistic but never cruel: no slurs, threats, or abuse.",
      "Speak only as the character, in 1 to 3 short paragraphs of at most about 60 words in total. No stage directions, no narration, no quotation marks around your speech.",
      `Respond with ONLY a JSON object, no markdown fences, in exactly this shape: {"reply": "<what you say; separate paragraphs with a blank line>", "tension": <integer 1-5>, "note": "<one short sentence on why the tension changed, or an empty string>"}`,
      `"tension" is how heated this conversation feels to your character right now: 1 is calm, 5 is very heated. It was ${tension} before the user's latest message. It rises when the user blames, generalizes, mocks, or pressures you, and falls when the user acknowledges your side, reflects it back, or asks a specific and curious question. Change it by at most 1 per turn.`,
    ].join("\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildReviewPrompt(persona: Persona, scenario: Scenario | undefined, moments: string[]): string {
  const list = moments.map((m, i) => `${i + 1}. ${m}`).join("\n");
  const context = scenario
    ? `A user practiced a conflict conversation with ${persona.name}. Scenario - ${scenario.title}: ${scenario.setup}`
    : `A user practiced a conflict conversation with ${persona.name}.`;
  return [
    context,
    `These are the user's messages that made the conversation more tense:\n${list}`,
    `For each one, write one warm, concrete sentence (at most 25 words) suggesting what the user could say or do differently. Do not rewrite the whole message and do not judge the user.`,
    `Respond with ONLY a JSON array of ${moments.length} strings, in the same order, no markdown fences.`,
  ].join("\n\n");
}
