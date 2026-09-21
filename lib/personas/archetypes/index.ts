import type { Persona } from "../types";
import { argumentative } from "./argumentative";
import { avoidant } from "./avoidant";
import { defensive } from "./defensive";

export const archetypes: Record<string, Persona> = {
  [defensive.id]: defensive,
  [argumentative.id]: argumentative,
  [avoidant.id]: avoidant,
};

export function getArchetype(id: string): Persona | undefined {
  return archetypes[id];
}

export { argumentative, avoidant, defensive };
