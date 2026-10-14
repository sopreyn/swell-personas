import type { MessageRole } from "@/lib/conversation/types";

/** One item in the transcript shown on screen. */
export interface ChatItem {
  id: number;
  kind: "them" | "me" | "note";
  lines: string[];
}

/** One turn of history the client sends to /api/chat. */
export interface HistoryTurn {
  role: MessageRole;
  content: string;
}

/** What /api/chat returns for each persona reply. */
export interface PersonaReply {
  reply: string[];
  /** 1 (calm) to 5 (blow-up). */
  tension: number;
  /** One sentence on the user's last message. Shown only in the review screen. */
  coach: string;
}

/** A record of one user message, used by the review screen. */
export interface TurnRecord {
  turn: number;
  text: string;
  tensionBefore: number;
  tensionAfter: number;
  delta: number;
  coach: string;
}

export interface ThreadGroup {
  day: string;
  items: { title: string; personaId: string; scenarioId: string; summary: string }[];
}
