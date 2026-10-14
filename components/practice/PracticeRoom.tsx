"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  getServerSnapshot,
  getSnapshot,
  groupSessions,
  newId,
  parseSessions,
  saveSession,
  subscribe,
} from "@/lib/practice/history";
import { findArchetype, findScenario } from "@/lib/practice/lookup";
import { fallbackSuggestions } from "@/lib/practice/suggestions";
import type {
  CatalogArchetype,
  CatalogScenario,
  ChatRequest,
  ChatResponse,
  PracticeMessage,
  PracticeUser,
  ReviewResponse,
  SessionRecord,
  TurnRecord,
} from "@/lib/practice/types";
import { ChatLog } from "./ChatLog";
import { Composer } from "./Composer";
import { ReviewPanel } from "./ReviewPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface PracticeRoomProps {
  catalog: CatalogArchetype[];
  user: PracticeUser;
}

// How long the typing dots show at minimum, so replies never snap in instantly.
const MIN_TYPING_MS = 800;

function openerMessages(scenario: CatalogScenario | undefined): PracticeMessage[] {
  if (!scenario) return [];
  return [{ id: `opener-${scenario.id}`, role: "assistant", content: scenario.opener.join("\n\n") }];
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let message = "Something went wrong. Try again.";
    try {
      const data = (await response.json()) as { error?: unknown };
      if (typeof data.error === "string") message = data.error;
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }
  return (await response.json()) as T;
}

export function PracticeRoom({ catalog, user }: PracticeRoomProps) {
  const first = catalog[0];
  const firstScenario = first?.scenarios[0];

  const [personaId, setPersonaId] = useState(first?.id ?? "");
  const [scenarioId, setScenarioId] = useState(firstScenario?.id ?? "");
  const [messages, setMessages] = useState<PracticeMessage[]>(() => openerMessages(firstScenario));
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [tension, setTension] = useState(1);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<"chat" | "review">("chat");
  const [railOpen, setRailOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  // Changes when a different session opens, so the chat log remounts at the bottom.
  const [logKey, setLogKey] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Bumped whenever the session changes, so late replies from an old session are dropped.
  const tokenRef = useRef(0);

  const rawSessions = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const sessions = useMemo(() => parseSessions(rawSessions), [rawSessions]);
  const groups = groupSessions(sessions);

  // Escape closes the mobile drawer.
  useEffect(() => {
    if (!railOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRailOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [railOpen]);

  const archetype = findArchetype(catalog, personaId);
  const scenario = findScenario(catalog, personaId, scenarioId);
  if (!archetype || !scenario) {
    return <p style={{ padding: 24 }}>No practice scenarios are configured yet.</p>;
  }

  function startSession(nextPersonaId: string, nextScenarioId: string) {
    const nextScenario = findScenario(catalog, nextPersonaId, nextScenarioId);
    if (!nextScenario) return;
    tokenRef.current += 1;
    setLogKey((k) => k + 1);
    setPersonaId(nextPersonaId);
    setScenarioId(nextScenarioId);
    setMessages(openerMessages(nextScenario));
    setTurns([]);
    setTension(1);
    setSessionId(null);
    setStartedAt(null);
    setDraft("");
    setBusy(false);
    setNotice(null);
    setView("chat");
    setRailOpen(false);
    inputRef.current?.focus();
  }

  function loadSession(record: SessionRecord) {
    if (!findScenario(catalog, record.personaId, record.scenarioId)) return;
    tokenRef.current += 1;
    setLogKey((k) => k + 1);
    setPersonaId(record.personaId);
    setScenarioId(record.scenarioId);
    setMessages(record.messages);
    setTurns(record.turns);
    setTension(record.tension);
    setSessionId(record.id);
    setStartedAt(record.startedAt);
    setDraft("");
    setBusy(false);
    setNotice(null);
    setView("chat");
    setRailOpen(false);
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;

    const token = tokenRef.current;
    const previousTension = tension;
    const turnIndex = turns.length;
    const withUser: PracticeMessage[] = [...messages, { id: newId(), role: "user", content: text }];

    setMessages(withUser);
    setDraft("");
    setBusy(true);
    setNotice(null);

    const request: ChatRequest = {
      personaId,
      scenarioId,
      tension: previousTension,
      turn: turnIndex,
      messages: withUser.map(({ role, content }) => ({ role, content })),
    };

    try {
      const [data] = await Promise.all([postJson<ChatResponse>("/api/chat", request), sleep(MIN_TYPING_MS)]);
      if (token !== tokenRef.current) return;

      const tensionAfter = data.tension;
      const turnRecord: TurnRecord = {
        turn: turnIndex,
        text,
        delta: Math.max(-1, Math.min(1, tensionAfter - previousTension)),
        tensionAfter,
      };
      const nextMessages: PracticeMessage[] = [
        ...withUser,
        { id: newId(), role: "assistant", content: data.reply.join("\n\n") },
      ];
      const nextTurns = [...turns, turnRecord];
      const id = sessionId ?? newId();
      const started = startedAt ?? Date.now();

      setMessages(nextMessages);
      setTurns(nextTurns);
      setTension(tensionAfter);
      setSessionId(id);
      setStartedAt(started);
      setBusy(false);

      saveSession({
        id,
        personaId,
        scenarioId,
        startedAt: started,
        updatedAt: Date.now(),
        messages: nextMessages,
        turns: nextTurns,
        tension: tensionAfter,
      });
    } catch (error) {
      if (token !== tokenRef.current) return;
      // Roll the message back into the box so nothing the user wrote is lost.
      setMessages(messages);
      setDraft(text);
      setBusy(false);
      setNotice(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  }

  async function openReview() {
    if (turns.length === 0) {
      setNotice("Send a few messages first. Review looks at how the conversation moved.");
      return;
    }
    const token = tokenRef.current;
    const moments = turns.filter((turn) => turn.delta > 0).map((turn) => turn.text);

    setSuggestions(fallbackSuggestions(moments.length));
    setView("review");
    if (moments.length === 0) {
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const data = await postJson<ReviewResponse>("/api/review", { personaId, scenarioId, moments });
      if (token === tokenRef.current && data.suggestions.length === moments.length) {
        setSuggestions(data.suggestions);
      }
    } catch {
      // The stock suggestions already on screen are a fine fallback.
    } finally {
      if (token === tokenRef.current) setLoadingSuggestions(false);
    }
  }

  return (
    <div
      className="practice"
      style={{ "--persona": archetype.color, "--persona-on": archetype.onColor } as CSSProperties}
    >
      <Sidebar
        groups={groups}
        activeId={sessionId}
        catalog={catalog}
        user={user}
        open={railOpen}
        onNew={() => startSession(personaId, scenarioId)}
        onSelect={loadSession}
        onQuiz={() => {
          setNotice(`This would open Swell's personality quiz so ${user.name} can retake it.`);
          setView("chat");
          setRailOpen(false);
        }}
      />
      <div className={`scrim${railOpen ? " open" : ""}`} onClick={() => setRailOpen(false)} />

      <main className="main">
        <TopBar
          catalog={catalog}
          archetype={archetype}
          scenarioId={scenarioId}
          scenarioLine={`${scenario.title} · ${scenario.setup}`}
          tension={tension}
          railOpen={railOpen}
          onPick={startSession}
          onMenu={() => setRailOpen(true)}
        />

        {view === "review" ? (
          <ReviewPanel
            scenarioTitle={scenario.title}
            archetypeName={archetype.name}
            turns={turns}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            onBack={() => setView("chat")}
            onRestart={() => startSession(personaId, scenarioId)}
          />
        ) : (
          <>
            <ChatLog
              key={logKey}
              archetypeName={archetype.name}
              setup={scenario.setup}
              messages={messages}
              busy={busy}
              notice={notice}
            />
            <Composer
              value={draft}
              busy={busy}
              inputRef={inputRef}
              onChange={setDraft}
              onSend={send}
              onEnd={openReview}
            />
          </>
        )}
      </main>
    </div>
  );
}
