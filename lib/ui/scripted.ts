import type { PracticeScenario } from "./scenarios";
import type { PersonaReply } from "./types";

const HOT = ["always", "never", "whatever", "unbelievable", "seriously", "kidding", "don't care", "forget it", "ridiculous"];
const CALM = ["understand", "hear you", "i hear", "sorry", "appreciate", "let's", "valid", "makes sense", "i get", "no rush", "take your time"];

/**
 * Offline fallback used only when ANTHROPIC_API_KEY is not set. Keyword-based
 * tension and canned lines, so the UI stays usable without a key.
 */
export function scriptedReply(
  scenario: PracticeScenario,
  text: string,
  tension: number,
  turn: number,
): PersonaReply {
  const t = text.toLowerCase();
  const delta = HOT.some((w) => t.includes(w)) ? 1 : CALM.some((w) => t.includes(w)) ? -1 : 0;
  const next = Math.max(1, Math.min(5, tension + delta));
  const pool = next >= 3 ? scenario.escalate : scenario.calm;
  return { reply: pool[Math.min(turn, pool.length - 1)], tension: next, coach: "" };
}
