import type { CatalogArchetype, CatalogScenario } from "./types";

export function findArchetype(catalog: CatalogArchetype[], id: string): CatalogArchetype | undefined {
  return catalog.find((a) => a.id === id);
}

export function findScenario(
  catalog: CatalogArchetype[],
  personaId: string,
  scenarioId: string,
): CatalogScenario | undefined {
  return findArchetype(catalog, personaId)?.scenarios.find((s) => s.id === scenarioId);
}
