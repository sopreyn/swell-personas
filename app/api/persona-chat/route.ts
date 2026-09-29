import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getArchetype } from "@/lib/personas/archetypes";
import { compileSystemPrompt } from "@/lib/personas/compile-system-prompt";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const personaId = typeof body?.personaId === "string" ? body.personaId : null;
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!personaId || !message) {
    return NextResponse.json({ error: "personaId and message are required" }, { status: 400 });
  }

  const persona = getArchetype(personaId);
  if (!persona) {
    return NextResponse.json({ error: `Unknown personaId: ${personaId}` }, { status: 400 });
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: compileSystemPrompt(persona),
      messages: [{ role: "user", content: message }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "The model declined to respond." }, { status: 502 });
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.Beta.BetaTextBlock => block.type === "text",
    );

    return NextResponse.json({ reply: textBlock?.text ?? "" });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 500 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unexpected error calling the model." }, { status: 500 });
  }
}
