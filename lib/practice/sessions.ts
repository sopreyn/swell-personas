// A past conversation as shown in the sidebar. Built from a Supabase
// ConversationSummary row (lib/conversation/db.ts -> listConversations).
export interface ConversationSummaryView {
  id: string;
  personaId: string;
  title: string;
  updatedAt: string;
}

export interface SessionGroup {
  label: string;
  items: ConversationSummaryView[];
}

// Buckets conversations into Today / This week / Earlier, newest first (input is
// already sorted by updated_at desc from the database).
export function groupConversations(conversations: ConversationSummaryView[]): SessionGroup[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();
  const weekAgo = today - 6 * 24 * 60 * 60 * 1000;

  const buckets: SessionGroup[] = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const conversation of conversations) {
    const updatedAt = new Date(conversation.updatedAt).getTime();
    if (updatedAt >= today) buckets[0].items.push(conversation);
    else if (updatedAt >= weekAgo) buckets[1].items.push(conversation);
    else buckets[2].items.push(conversation);
  }
  return buckets.filter((b) => b.items.length > 0);
}

// One-line timestamp shown under each session title in the sidebar.
export function describeUpdatedAt(conversation: ConversationSummaryView): string {
  return new Date(conversation.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
