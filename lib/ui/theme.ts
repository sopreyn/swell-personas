/**
 * Accent color per persona id. UI only; persona behavior lives in lib/personas.
 * Add an entry here when you add an archetype.
 */
export const personaColors: Record<string, string> = {
  defensive: "#F1653D",
  argumentative: "#E29A2E",
  avoidant: "#9A6FD1",
};

const FALLBACK_COLOR = "#6E8CA8";

export function personaColor(personaId: string): string {
  return personaColors[personaId] ?? FALLBACK_COLOR;
}
