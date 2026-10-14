import { getArchetype } from "@/lib/personas/archetypes";
import { getScenario } from "@/lib/personas/scenarios";
import { completeText, extractJson, hasApiKey } from "@/lib/practice/claude";
import { buildReviewPrompt } from "@/lib/practice/prompt";
import { fallbackSuggestions } from "@/lib/practice/suggestions";
import type { ReviewResponse } from "@/lib/practice/types";
import { parseReviewRequest } from "@/lib/practice/validate";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const input = parseReviewRequest(body);
  if (!input) return Response.json({ error: "Invalid review request." }, { status: 400 });

  const persona = getArchetype(input.personaId);
  const scenario = getScenario(input.scenarioId);
  if (!persona || !scenario || scenario.personaId !== persona.id) {
    return Response.json({ error: "Unknown archetype or scenario." }, { status: 404 });
  }

  const scripted: ReviewResponse = { suggestions: fallbackSuggestions(input.moments.length), source: "scripted" };
  if (!hasApiKey()) return Response.json(scripted);

  try {
    const text = await completeText(
      "You are a warm, practical communication coach.",
      [{ role: "user", content: buildReviewPrompt(persona, scenario, input.moments) }],
      700,
    );
    const parsed = extractJson(text, "[");
    if (!Array.isArray(parsed)) return Response.json(scripted);

    // Use the model's line where it gave a usable one, the stock line otherwise.
    const suggestions = input.moments.map((_, i) => {
      const item = parsed[i];
      return typeof item === "string" && item.trim() ? item.trim().slice(0, 300) : scripted.suggestions[i];
    });
    const payload: ReviewResponse = { suggestions, source: "claude" };
    return Response.json(payload);
  } catch (error) {
    console.error("[api/review] model call failed:", error);
    return Response.json(scripted);
  }
}
