import { randomUUID } from "crypto";
import type { ConversationRecord, ConversationState, Message, MessageRole } from "./types";

export function createConversation(personaId: string, scenarioId: string): ConversationState {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    personaId,
    scenarioId,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function appendMessage(
  state: ConversationState,
  role: MessageRole,
  content: string,
): ConversationState {
  const message: Message = { role, content, createdAt: new Date().toISOString() };
  return {
    ...state,
    messages: [...state.messages, message],
    updatedAt: message.createdAt,
  };
}

// The JSON payload handed to the database layer for persistence (messages as a jsonb array).
export function toConversationRecord(state: ConversationState): ConversationRecord {
  return {
    id: state.id,
    persona_id: state.personaId,
    scenario_id: state.scenarioId,
    messages: state.messages,
    created_at: state.createdAt,
    updated_at: state.updatedAt,
  };
}

export function fromConversationRecord(record: ConversationRecord): ConversationState {
  return {
    id: record.id,
    personaId: record.persona_id,
    scenarioId: record.scenario_id,
    messages: record.messages,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

// The message list in the shape the Claude Messages API expects (system prompt is passed separately).
export function toAnthropicMessages(state: ConversationState): { role: MessageRole; content: string }[] {
  return state.messages.map(({ role, content }) => ({ role, content }));
}
