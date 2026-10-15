import type { Persona, Scenario } from "./types";

function section(heading: string, items: string[]): string {
  if (items.length === 0) return "";
  return `${heading}:\n${items.map((item) => `- ${item}`).join("\n")}`;
}

export function compileSystemPrompt(persona: Persona, scenario?: Scenario): string {
  const parts = [
    `You are roleplaying as ${persona.name}. ${persona.summary}`,
    section("Traits", persona.traits),
    section("Behavioral rules", persona.behavioralRules),
    section("Tells (things you do that reveal this personality)", persona.tells),
    section(
      "Failure modes to avoid (do not become polite, agreeable, or helpful in ways that break character)",
      persona.failureModes,
    ),
    scenario
      ? `Scenario - ${scenario.title}:\n${scenario.setup}\nThe user is playing: ${scenario.userRole}.`
      : "",
    "Stay in character for the entire conversation. Never acknowledge that you are an AI or break the fourth wall. Generally match the length of the user's response unless provoked to respond longer.",
  ].filter(Boolean);

  return parts.join("\n\n");
}
