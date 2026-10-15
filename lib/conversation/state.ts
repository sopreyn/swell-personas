import type { Persona, Scenario } from "../personas/types";
import type { ConversationRecord, ConversationState } from "./types";

export function fromConversationRecord(record: ConversationRecord): ConversationState {
  return {
    id: record.id,
    userId: record.user_id,
    personality: record.personality,
    title: record.title,
    messages: record.conversation ?? [],
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// e.g. "Missed deadline · The Defensive · Oct 13, 2026", or without a scenario "The Defensive · Oct 13, 2026".
export function buildConversationTitle(persona: Persona, scenario?: Scenario, date = new Date()): string {
  const formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return [scenario?.title, persona.name, formattedDate].filter(Boolean).join(" · ");
}

// The message list in the shape the Claude Messages API expects (system prompt is passed separately).
export function toAnthropicMessages(
  state: ConversationState,
): { role: "user" | "assistant"; content: string }[] {
  return state.messages.map(({ role, content }) => ({
    role: role === "ai" ? "assistant" : "user",
    content,
  }));
}
