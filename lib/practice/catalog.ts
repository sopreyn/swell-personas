import { archetypes } from "@/lib/personas/archetypes";
import { scenariosFor } from "@/lib/personas/scenarios";
import type { CatalogArchetype, PracticeUser } from "./types";

// Accent colour per archetype id. Exposed in the UI as the --persona CSS variable.
const ARCHETYPE_COLORS: Record<string, string> = {
  defensive: "#F1653D",
  argumentative: "#E29A2E",
  avoidant: "#9A6FD1",
};
const FALLBACK_COLOR = "#F1653D";

function luminance(hex: string): number {
  const channel = (start: number) => {
    const v = parseInt(hex.slice(start, start + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

// White on the accent when it reads clearly (3:1 for UI glyphs), the dark ink otherwise.
function pickOnColor(hex: string): string {
  const contrastWithWhite = 1.05 / (luminance(hex) + 0.05);
  return contrastWithWhite >= 3 ? "#FFFFFF" : "#2A2140";
}

// Order the picker shows archetypes in.
const ORDER = ["defensive", "argumentative", "avoidant"];

// Builds the browser-safe archetype list from the persona definitions in lib/personas.
export function buildCatalog(): CatalogArchetype[] {
  const ids = [...ORDER, ...Object.keys(archetypes).filter((id) => !ORDER.includes(id))];
  return ids
    .filter((id) => archetypes[id])
    .map((id) => {
      const persona = archetypes[id];
      const color = ARCHETYPE_COLORS[id] ?? FALLBACK_COLOR;
      return {
        id,
        name: persona.name,
        blurb: persona.summary,
        color,
        onColor: pickOnColor(color),
        scenarios: scenariosFor(id).map(({ id: sid, title, setup, opener }) => ({
          id: sid,
          title,
          setup,
          opener,
        })),
      };
    })
    .filter((a) => a.scenarios.length > 0);
}

// Stand-in until the real signed-in user and their assigned personality type are available.
export const PLACEHOLDER_USER: PracticeUser = {
  name: "Placeholder_Name",
  initials: "PN",
  personalityType: "Accommodating",
};
