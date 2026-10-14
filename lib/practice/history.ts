import type { PracticeMessage, SessionRecord, TurnRecord } from "./types";

// Browser-side session history for the sidebar. It lives in localStorage for now;
// the same SessionRecord shape (messages plus per-turn tension) can move into
// Supabase or Neon later without changing the UI.

const STORAGE_KEY = "swell.practice.sessions.v1";
const MAX_SESSIONS = 30;

const listeners = new Set<() => void>();
let cache: string | null = null;

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function emit() {
  listeners.forEach((listener) => listener());
}

// useSyncExternalStore wiring. The snapshot is the raw JSON string so it stays referentially stable.
export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): string {
  if (cache === null) {
    try {
      cache = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
    } catch {
      cache = "[]";
    }
  }
  return cache;
}

export function getServerSnapshot(): string {
  return "[]";
}

function isMessage(value: unknown): value is PracticeMessage {
  const m = value as PracticeMessage;
  return (
    typeof m === "object" &&
    m !== null &&
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function isTurn(value: unknown): value is TurnRecord {
  const t = value as TurnRecord;
  return (
    typeof t === "object" &&
    t !== null &&
    typeof t.turn === "number" &&
    typeof t.text === "string" &&
    typeof t.delta === "number" &&
    typeof t.tensionAfter === "number"
  );
}

export function parseSessions(raw: string): SessionRecord[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter((s): s is SessionRecord => {
      const r = s as SessionRecord;
      return (
        typeof r === "object" &&
        r !== null &&
        typeof r.id === "string" &&
        typeof r.personaId === "string" &&
        typeof r.scenarioId === "string" &&
        typeof r.startedAt === "number" &&
        typeof r.updatedAt === "number" &&
        typeof r.tension === "number" &&
        Array.isArray(r.messages) &&
        r.messages.every(isMessage) &&
        Array.isArray(r.turns) &&
        r.turns.every(isTurn)
      );
    });
  } catch {
    return [];
  }
}

export function saveSession(record: SessionRecord): void {
  const others = parseSessions(getSnapshot()).filter((s) => s.id !== record.id);
  const next = [record, ...others].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_SESSIONS);
  const json = JSON.stringify(next);
  cache = json;
  try {
    window.localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // Storage may be full or blocked. The in-memory copy still updates the sidebar for this visit.
  }
  emit();
}

// One-line outcome shown under each session title in the sidebar.
export function describeOutcome(session: SessionRecord): string {
  if (session.turns.length === 0) return "Just started";
  const peak = Math.max(...session.turns.map((t) => t.tensionAfter));
  const rounds = `${session.turns.length} ${session.turns.length === 1 ? "round" : "rounds"}`;
  if (peak <= 2) return `${rounds}, stayed calm`;
  if (peak >= 4) {
    return session.tension < peak ? `Tension peaked at ${peak}, then eased` : `Tension reached ${peak} of 5`;
  }
  return session.tension < peak ? `${rounds}, brought it back down` : `${rounds}, tension at ${peak} of 5`;
}

export interface SessionGroup {
  label: string;
  items: SessionRecord[];
}

// Buckets sessions into Today / This week / Earlier, newest first.
export function groupSessions(sessions: SessionRecord[]): SessionGroup[] {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const today = startOfToday.getTime();
  const weekAgo = today - 6 * 24 * 60 * 60 * 1000;

  const buckets: SessionGroup[] = [
    { label: "Today", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];
  for (const session of sessions) {
    if (session.updatedAt >= today) buckets[0].items.push(session);
    else if (session.updatedAt >= weekAgo) buckets[1].items.push(session);
    else buckets[2].items.push(session);
  }
  return buckets.filter((b) => b.items.length > 0);
}
