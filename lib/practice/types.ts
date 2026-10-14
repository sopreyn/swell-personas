// Shared types for the Practice Room UI and its API routes.

export type PracticeRole = "user" | "assistant";

// Assistant content may hold several short paragraphs separated by a blank line.
export interface PracticeMessage {
  id: string;
  role: PracticeRole;
  content: string;
}

// One record per user turn, used to draw the review screen.
export interface TurnRecord {
  turn: number;
  text: string;
  delta: number;
  tensionAfter: number;
}

export interface SessionRecord {
  id: string;
  personaId: string;
  scenarioId: string;
  startedAt: number;
  updatedAt: number;
  messages: PracticeMessage[];
  turns: TurnRecord[];
  tension: number;
}

// What the browser knows about an archetype. Persona rules stay on the server.
export interface CatalogScenario {
  id: string;
  title: string;
  setup: string;
  opener: string[];
}

export interface CatalogArchetype {
  id: string;
  name: string;
  blurb: string;
  color: string;
  // Readable text/icon colour to sit on top of `color` (send button, review button).
  onColor: string;
  scenarios: CatalogScenario[];
}

export interface PracticeUser {
  name: string;
  initials: string;
  personalityType: string;
}

// POST /api/chat
export interface ChatRequest {
  personaId: string;
  scenarioId: string;
  tension: number;
  turn: number;
  messages: { role: PracticeRole; content: string }[];
}

export interface ChatResponse {
  reply: string[];
  tension: number;
  note: string;
  source: "claude" | "scripted";
}

// POST /api/review
export interface ReviewRequest {
  personaId: string;
  scenarioId: string;
  moments: string[];
}

export interface ReviewResponse {
  suggestions: string[];
  source: "claude" | "scripted";
}

export const MIN_TENSION = 1;
export const MAX_TENSION = 5;

export function clampTension(value: number): number {
  if (!Number.isFinite(value)) return MIN_TENSION;
  return Math.max(MIN_TENSION, Math.min(MAX_TENSION, Math.round(value)));
}
