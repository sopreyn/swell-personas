import Anthropic from "@anthropic-ai/sdk";

// Server-only helpers around the Anthropic TypeScript SDK.

export const DEFAULT_MODEL = "claude-sonnet-5-5";

let client: Anthropic | null = null;

export function hasApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export async function completeText(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 500,
): Promise<string> {
  const response = await getClient().messages.create({
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    max_tokens: maxTokens,
    system,
    messages,
  });
  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}

// Models occasionally wrap JSON in prose or code fences, so cut out the outermost value.
export function extractJson(text: string, open: "{" | "["): unknown {
  const close = open === "{" ? "}" : "]";
  const start = text.indexOf(open);
  const end = text.lastIndexOf(close);
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}
