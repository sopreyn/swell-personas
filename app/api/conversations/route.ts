import { getArchetype } from "@/lib/personas/archetypes";
import { getScenario } from "@/lib/personas/scenarios";
import { createConversation, listConversations } from "@/lib/conversation/db";

export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId) return Response.json({ error: "userId is required." }, { status: 400 });

  try {
    const summaries = await listConversations(userId);
    return Response.json(
      summaries.map((s) => ({ id: s.id, personaId: s.personality, title: s.title, updatedAt: s.updatedAt })),
    );
  } catch (error) {
    console.error("[api/conversations] list failed:", error);
    return Response.json({ error: "Could not load past sessions." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { personaId, userId, scenarioId } = (body ?? {}) as Record<string, unknown>;
  if (typeof personaId !== "string" || typeof userId !== "string") {
    return Response.json({ error: "personaId and userId are required." }, { status: 400 });
  }

  const persona = getArchetype(personaId);
  if (!persona) return Response.json({ error: `Unknown persona: ${personaId}` }, { status: 404 });
  const scenario = typeof scenarioId === "string" ? getScenario(scenarioId) : undefined;

  try {
    const conversation = await createConversation({ personaId, userId, scenario });
    return Response.json({ id: conversation.id, title: conversation.title });
  } catch (error) {
    console.error("[api/conversations] create failed:", error);
    return Response.json({ error: "Could not start a new session." }, { status: 502 });
  }
}
