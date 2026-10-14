import Anthropic from "@anthropic-ai/sdk";
import { getArchetype } from "@/lib/personas/archetypes";
import { buildChatSystemPrompt } from "@/lib/ui/chat-prompt";
import { getPracticeScenario } from "@/lib/ui/scenarios";
import type { HistoryTurn, PersonaReply } from "@/lib/ui/types";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_HISTORY = 40;
const MAX_MESSAGE_CHARS = 2000;

interface ChatBody {
  personaId: string;
  scenarioId: string;
  history: HistoryTurn[];
  message: string;
  tension?: number;
}

/** Pulls the first JSON object out of the model's text, tolerating stray prose or code fences. */
function parseReply(text: string, fallbackTension: number): PersonaReply | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const raw = JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    const lines = Array.isArray(raw.reply)
      ? raw.reply.map(String)
      : typeof raw.reply === "string"
        ? [raw.reply]
        : [];
    const reply = lines.map((l) => l.trim()).filter(Boolean);
    if (!reply.length) return null;
    const t = Math.round(Number(raw.tension));
    return {
      reply,
      tension: Number.isFinite(t) ? Math.max(1, Math.min(5, t)) : fallbackTension,
      coach: typeof raw.coach === "string" ? raw.coach.trim() : "",
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "no_api_key" }, { status: 503 });
  }

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  // Persona and scenario are looked up on the server, so the client can't change the prompt.
  const persona = getArchetype(String(body.personaId));
  const scenario = persona ? getPracticeScenario(persona.id, String(body.scenarioId)) : undefined;
  const message = typeof body.message === "string" ? body.message.trim().slice(0, MAX_MESSAGE_CHARS) : "";
  if (!persona || !scenario || !message) {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const history = (Array.isArray(body.history) ? body.history : [])
    .filter((t) => (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string" && t.content.trim())
    .slice(-MAX_HISTORY);

  // The API wants the conversation to start with a user turn and alternate roles,
  // so merge any consecutive turns that share a role.
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: "(The conversation begins. Say your opening lines.)" },
    { role: "assistant", content: JSON.stringify({ reply: scenario.opener, tension: 1, coach: "" }) },
  ];
  for (const turn of [...history, { role: "user" as const, content: message }]) {
    const last = messages[messages.length - 1];
    if (last.role === turn.role && typeof last.content === "string") {
      last.content += "\n\n" + turn.content;
    } else {
      messages.push({ role: turn.role, content: turn.content });
    }
  }

  try {
    const client = new Anthropic();
    const resp = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: buildChatSystemPrompt(persona, scenario),
      messages,
    });
    const text = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const parsed = parseReply(text, body.tension ?? 1);
    if (!parsed) return Response.json({ error: "bad_model_output" }, { status: 502 });
    return Response.json(parsed);
  } catch (err) {
    const rateLimited = err instanceof Anthropic.APIError && err.status === 429;
    return Response.json(
      { error: rateLimited ? "rate_limited" : "upstream_error" },
      { status: rateLimited ? 429 : 502 },
    );
  }
}
