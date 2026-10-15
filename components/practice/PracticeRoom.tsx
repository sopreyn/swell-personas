"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { getAnonUserIdServerSnapshot, getAnonUserIdSnapshot, subscribeAnonUserId } from "@/lib/practice/anon-user";
import { newId } from "@/lib/practice/id";
import { findArchetype, findScenario } from "@/lib/practice/lookup";
import { groupConversations, type ConversationSummaryView } from "@/lib/practice/sessions";
import { fallbackSuggestions } from "@/lib/practice/suggestions";
import type {
  CatalogArchetype,
  CatalogScenario,
  ChatRequest,
  ChatResponse,
  PracticeMessage,
  PracticeUser,
  ReviewResponse,
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

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
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

  const userId = useSyncExternalStore(subscribeAnonUserId, getAnonUserIdSnapshot, getAnonUserIdServerSnapshot);
  const [summaries, setSummaries] = useState<ConversationSummaryView[]>([]);

  const [personaId, setPersonaId] = useState(first?.id ?? "");
  // Empty once a past conversation is resumed - its original scenario isn't stored.
  const [scenarioId, setScenarioId] = useState(firstScenario?.id ?? "");
  const [messages, setMessages] = useState<PracticeMessage[]>(() => openerMessages(firstScenario));
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [tension, setTension] = useState(1);
  // The Supabase conversation id. Null until the first message of a session is sent.
  const [sessionId, setSessionId] = useState<string | null>(null);
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

  const groups = groupConversations(summaries);

  async function refreshSessions(forUserId: string) {
    try {
      const data = await getJson<ConversationSummaryView[]>(
        `/api/conversations?userId=${encodeURIComponent(forUserId)}`,
      );
      setSummaries(data);
    } catch {
      // Keep whatever was already shown; the sidebar just won't update this time.
    }
  }

  // Load this user's past sessions once the anon user id is available (client-only).
  // refreshSessions only calls setSummaries after its fetch resolves, not synchronously.
  useEffect(() => {
    if (!userId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSessions(userId);
  }, [userId]);

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
  const scenario = scenarioId ? findScenario(catalog, personaId, scenarioId) : undefined;
  if (!archetype) {
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
    setDraft("");
    setBusy(false);
    setNotice(null);
    setView("chat");
    setRailOpen(false);
    inputRef.current?.focus();
  }

  async function loadSession(summary: ConversationSummaryView) {
    tokenRef.current += 1;
    const token = tokenRef.current;
    setLogKey((k) => k + 1);
    setPersonaId(summary.personaId);
    // The original scenario isn't stored, so the picker/topbar fall back to a generic label.
    setScenarioId("");
    setMessages([]);
    setTurns([]);
    setTension(1);
    setSessionId(summary.id);
    setDraft("");
    setBusy(false);
    setNotice(null);
    setView("chat");
    setRailOpen(false);

    try {
      const conversation = await getJson<{ messages: { role: "user" | "ai"; content: string }[] }>(
        `/api/conversations/${summary.id}`,
      );
      if (token !== tokenRef.current) return;
      setMessages(
        conversation.messages.map((m) => ({
          id: newId(),
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content,
        })),
      );
    } catch (error) {
      if (token !== tokenRef.current) return;
      setNotice(error instanceof Error ? error.message : "Could not load this session.");
    }
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy || !userId) return;

    const token = tokenRef.current;
    const previousTension = tension;
    const turnIndex = turns.length;
    const withUser: PracticeMessage[] = [...messages, { id: newId(), role: "user", content: text }];

    setMessages(withUser);
    setDraft("");
    setBusy(true);
    setNotice(null);

    try {
      let conversationId = sessionId;
      if (!conversationId) {
        const created = await postJson<{ id: string }>("/api/conversations", { personaId, userId, scenarioId });
        conversationId = created.id;
      }

      const request: ChatRequest = {
        conversationId,
        personaId,
        scenarioId,
        tension: previousTension,
        turn: turnIndex,
        messages: withUser.map(({ role, content }) => ({ role, content })),
      };

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

      setMessages(nextMessages);
      setTurns((prev) => [...prev, turnRecord]);
      setTension(tensionAfter);
      setSessionId(conversationId);
      setBusy(false);

      refreshSessions(userId);
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

  function startFreshSession() {
    const target = findArchetype(catalog, personaId) ?? first;
    const targetScenario = target?.scenarios[0];
    if (target && targetScenario) startSession(target.id, targetScenario.id);
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
        onNew={startFreshSession}
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
          scenarioLine={scenario ? `${scenario.title} · ${scenario.setup}` : "Continuing a previous conversation"}
          tension={tension}
          railOpen={railOpen}
          onPick={startSession}
          onMenu={() => setRailOpen(true)}
        />

        {view === "review" ? (
          <ReviewPanel
            scenarioTitle={scenario?.title ?? "Previous conversation"}
            archetypeName={archetype.name}
            turns={turns}
            suggestions={suggestions}
            loadingSuggestions={loadingSuggestions}
            onBack={() => setView("chat")}
            onRestart={startFreshSession}
          />
        ) : (
          <>
            <ChatLog
              key={logKey}
              archetypeName={archetype.name}
              setup={scenario?.setup ?? ""}
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
