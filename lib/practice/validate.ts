import { clampTension, type ChatRequest, type ReviewRequest } from "./types";

const MAX_MESSAGES = 60;
const MAX_CONTENT = 2000;
const MAX_MOMENTS = 20;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseChatRequest(body: unknown): ChatRequest | null {
  if (!isRecord(body)) return null;
  const { personaId, scenarioId, tension, turn, messages } = body;
  if (typeof personaId !== "string" || typeof scenarioId !== "string") return null;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) return null;

  const clean: ChatRequest["messages"] = [];
  for (const m of messages) {
    if (!isRecord(m)) return null;
    if (m.role !== "user" && m.role !== "assistant") return null;
    if (typeof m.content !== "string" || m.content.length === 0 || m.content.length > MAX_CONTENT) return null;
    clean.push({ role: m.role, content: m.content });
  }
  if (clean[clean.length - 1].role !== "user") return null;

  return {
    personaId,
    scenarioId,
    tension: clampTension(typeof tension === "number" ? tension : 1),
    turn: typeof turn === "number" && turn >= 0 ? Math.floor(turn) : 0,
    messages: clean,
  };
}

export function parseReviewRequest(body: unknown): ReviewRequest | null {
  if (!isRecord(body)) return null;
  const { personaId, scenarioId, moments } = body;
  if (typeof personaId !== "string" || typeof scenarioId !== "string") return null;
  if (!Array.isArray(moments) || moments.length === 0 || moments.length > MAX_MOMENTS) return null;
  if (!moments.every((m) => typeof m === "string" && m.length > 0 && m.length <= MAX_CONTENT)) return null;
  return { personaId, scenarioId, moments: moments as string[] };
}
