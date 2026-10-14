export type MessageRole = "user" | "ai";

// One entry in the conversations.conversation jsonb array.
export interface Message {
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ConversationState {
  id: string;
  userId: string;
  personality: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

// A row of the conversations table, as returned by Supabase.
export interface ConversationRecord {
  id: string;
  user_id: string;
  personality: string;
  title: string;
  conversation: Message[] | null;
  created_at: string;
  updated_at: string;
}

// A conversation without its messages, for listing past conversations.
export type ConversationSummary = Omit<ConversationState, "messages">;
