import { getConversation } from "@/lib/conversation/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const conversation = await getConversation(id);
    if (!conversation) return Response.json({ error: "Conversation not found." }, { status: 404 });
    return Response.json(conversation);
  } catch (error) {
    console.error("[api/conversations/:id] load failed:", error);
    return Response.json({ error: "Could not load this session." }, { status: 502 });
  }
}
