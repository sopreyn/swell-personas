import { randomUUID } from "crypto";
import { getArchetype } from "../personas/archetypes";
import type { Scenario } from "../personas/types";
import { getSupabase } from "../supabase";
import { buildConversationTitle, fromConversationRecord } from "./state";
import type { ConversationRecord, ConversationState, ConversationSummary, MessageRole } from "./types";

const SUMMARY_COLUMNS = "id, user_id, personality, title, created_at, updated_at";

interface CreateConversationInput {
  personaId: string;
  // Supplied by whatever handles sign-in in the parent app.
  userId: string;
  scenario?: Scenario;
}

// Inserts a new conversation with an empty message list. created_at and updated_at use the table defaults.
export async function createConversation({
  personaId,
  userId,
  scenario,
}: CreateConversationInput): Promise<ConversationState> {
  const persona = getArchetype(personaId);
  if (!persona) throw new Error(`Unknown persona: ${personaId}`);

  const { data, error } = await getSupabase()
    .from("conversations")
    .insert({
      id: randomUUID(),
      user_id: userId,
      personality: persona.id,
      title: buildConversationTitle(persona, scenario),
      conversation: [],
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to create conversation: ${error.message}`);
  return fromConversationRecord(data as ConversationRecord);
}

// Appends a message and bumps updated_at atomically via the append_message database function.
export async function appendMessage(
  conversationId: string,
  role: MessageRole,
  content: string,
): Promise<ConversationState> {
  const { data, error } = await getSupabase()
    .rpc("append_message", { p_conversation_id: conversationId, p_role: role, p_content: content })
    .single();

  if (error) throw new Error(`Failed to append message: ${error.message}`);
  return fromConversationRecord(data as ConversationRecord);
}

export async function getConversation(conversationId: string): Promise<ConversationState | null> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .select()
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw new Error(`Failed to load conversation: ${error.message}`);
  return data ? fromConversationRecord(data as ConversationRecord) : null;
}

// A user's conversations, most recently active first, without message bodies (for a history sidebar).
export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const { data, error } = await getSupabase()
    .from("conversations")
    .select(SUMMARY_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to list conversations: ${error.message}`);
  return (data as Omit<ConversationRecord, "conversation">[]).map((record) => ({
    id: record.id,
    userId: record.user_id,
    personality: record.personality,
    title: record.title,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }));
}
