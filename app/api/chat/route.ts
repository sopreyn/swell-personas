import { getArchetype } from "@/lib/personas/archetypes";
import { getScenario } from "@/lib/personas/scenarios";
import { completeText, extractJson, hasApiKey } from "@/lib/practice/claude";
import { PLACEHOLDER_USER } from "@/lib/practice/catalog";
import { buildChatSystemPrompt } from "@/lib/practice/prompt";
import { scriptedReply } from "@/lib/practice/scripted";
import { clampTension, type ChatResponse } from "@/lib/practice/types";
import { parseChatRequest } from "@/lib/practice/validate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const input = parseChatRequest(body);
  if (!input) return Response.json({ error: "Invalid chat request." }, { status: 400 });

  const persona = getArchetype(input.personaId);
  const scenario = getScenario(input.scenarioId);
  if (!persona || !scenario || scenario.personaId !== persona.id) {
    return Response.json({ error: "Unknown archetype or scenario." }, { status: 404 });
  }

  const latest = input.messages[input.messages.length - 1].content;

  // No API key: fall back to the scripted replies so the UI still works locally.
  if (!hasApiKey()) {
    const scripted = scriptedReply(scenario.id, latest, input.tension, input.turn);
    const payload: ChatResponse = { ...scripted, source: "scripted" };
    return Response.json(payload);
  }

  // The Messages API must start with a user turn, so the persona's opening lines
  // move into the system prompt instead.
  const firstUser = input.messages.findIndex((m) => m.role === "user");
  const opener = input.messages
    .slice(0, firstUser)
    .map((m) => m.content)
    .join("\n\n");
  const conversation = input.messages.slice(firstUser);

  try {
    const text = await completeText(
      buildChatSystemPrompt({
        persona,
        scenario,
        userType: PLACEHOLDER_USER.personalityType,
        tension: input.tension,
        opener,
      }),
      conversation,
    );

    const parsed = extractJson(text, "{") as { reply?: unknown; tension?: unknown; note?: unknown } | null;
    const replyText = typeof parsed?.reply === "string" ? parsed.reply : text;
    const reply = replyText
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .slice(0, 4);
    if (reply.length === 0) throw new Error("Empty reply from model");

    // Keep the meter believable: at most one step per turn.
    const proposed = typeof parsed?.tension === "number" ? clampTension(parsed.tension) : input.tension;
    const tension = clampTension(Math.max(input.tension - 1, Math.min(input.tension + 1, proposed)));

    const payload: ChatResponse = {
      reply,
      tension,
      note: typeof parsed?.note === "string" ? parsed.note.slice(0, 200) : "",
      source: "claude",
    };
    return Response.json(payload);
  } catch (error) {
    console.error("[api/chat] model call failed:", error);
    return Response.json({ error: "The persona couldn't respond. Try again." }, { status: 502 });
  }
}
