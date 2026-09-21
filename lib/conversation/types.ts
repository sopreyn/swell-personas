export type MessageRole = "user" | "assistant";

export interface Message {
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface ConversationState {
  id: string;
  personaId: string;
  scenarioId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationRecord {
  id: string;
  persona_id: string;
  scenario_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}
