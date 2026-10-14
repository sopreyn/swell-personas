"use client";

import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ChatLog from "@/components/ChatLog";
import Composer from "@/components/Composer";
import ReviewPanel from "@/components/ReviewPanel";
import { getArchetype } from "@/lib/personas/archetypes";
import { getPracticeScenario } from "@/lib/ui/scenarios";
import type { PracticeScenario } from "@/lib/ui/scenarios";
import { scriptedReply } from "@/lib/ui/scripted";
import { personaColor } from "@/lib/ui/theme";
import type { ChatItem, HistoryTurn, PersonaReply, TurnRecord } from "@/lib/ui/types";

const DEFAULT_PERSONA = "defensive";
const DEFAULT_SCENARIO = "deadline";

function openingItems(scenario: PracticeScenario): ChatItem[] {
  return [
    { id: 0, kind: "note", lines: [scenario.setup] },
    { id: 1, kind: "them", lines: scenario.opener },
  ];
}

export default function Page() {
  const [sel, setSel] = useState({ personaId: DEFAULT_PERSONA, scenarioId: DEFAULT_SCENARIO });

  const persona = getArchetype(sel.personaId)!;
  const scenario = getPracticeScenario(sel.personaId, sel.scenarioId)!;
  const color = personaColor(persona.id);

  const [items, setItems] = useState<ChatItem[]>(() =>
    openingItems(getPracticeScenario(DEFAULT_PERSONA, DEFAULT_SCENARIO)!),
  );
  const [history, setHistory] = useState<HistoryTurn[]>([]);
  const [turns, setTurns] = useState<TurnRecord[]>([]);
  const [tension, setTension] = useState(1);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [railOpen, setRailOpen] = useState(false);

  // If the server reports no API key, use scripted replies for the rest of the page load.
  const claudeOn = useRef(true);
  const session = useRef(0);
  const abort = useRef<AbortController | null>(null);

  function startSession(personaId: string, scenarioId: string) {
    const next = getPracticeScenario(personaId, scenarioId);
    if (!next) return;
    abort.current?.abort();
    session.current += 1;
    setSel({ personaId, scenarioId });
    setItems(openingItems(next));
    setHistory([]);
    setTurns([]);
    setTension(1);
    setBusy(false);
    setReviewing(false);
  }

  const addNote = (text: string) =>
    setItems((prev) => [...prev, { id: prev.length, kind: "note", lines: [text] }]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;

    const myIndex = items.length;
    const mySession = session.current;
    const turnIndex = turns.length;
    const before = tension;

    setItems((prev) => [...prev, { id: prev.length, kind: "me", lines: [text] }]);
    setDraft("");
    setBusy(true);

    let reply: PersonaReply | null = null;

    if (claudeOn.current) {
      const ctl = new AbortController();
      abort.current = ctl;
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId: sel.personaId,
            scenarioId: sel.scenarioId,
            history,
            message: text,
            tension: before,
          }),
          signal: ctl.signal,
        });
        if (mySession !== session.current) return;

        if (res.status === 503) {
          // No ANTHROPIC_API_KEY on the server.
          claudeOn.current = false;
          addNote("No ANTHROPIC_API_KEY is set on the server, so replies are scripted. Add one to .env.local for live conversation.");
        } else if (!res.ok) {
          throw new Error("chat_failed");
        } else {
          reply = (await res.json()) as PersonaReply;
          setHistory((h) => [
            ...h,
            { role: "user", content: text },
            { role: "assistant", content: JSON.stringify(reply) },
          ]);
        }
      } catch (e) {
        if (mySession !== session.current || (e as Error).name === "AbortError") return;
        // Put the message back so the user can resend it.
        setItems((prev) => prev.filter((m) => m.id !== myIndex));
        setDraft(text);
        addNote("That reply didn't come through. Your message is back in the box, so you can send it again.");
        setBusy(false);
        return;
      }
    }

    const r = reply ?? scriptedReply(scenario, text, before, turnIndex);
    setTension(r.tension);
    setTurns((prev) => [
      ...prev,
      { turn: turnIndex, text, tensionBefore: before, tensionAfter: r.tension, delta: r.tension - before, coach: r.coach },
    ]);
    setItems((prev) => [...prev, { id: prev.length, kind: "them", lines: r.reply }]);
    setBusy(false);
  }

  function endAndReview() {
    if (!turns.length) {
      addNote("Send a few messages first. Review looks at how the conversation moved.");
      return;
    }
    setReviewing(true);
  }

  return (
    <div className="app" style={{ "--persona": color } as CSSProperties}>
      <Sidebar
        open={railOpen}
        activeKey={sel.personaId + ":" + sel.scenarioId}
        onPick={(p, s) => {
          startSession(p, s);
          setRailOpen(false);
        }}
        onNew={() => {
          startSession(sel.personaId, sel.scenarioId);
          setRailOpen(false);
        }}
      />
      <div className={"scrim" + (railOpen ? " open" : "")} onClick={() => setRailOpen(false)} />

      <main className={"main" + (reviewing ? " reviewing" : "")}>
        <TopBar
          persona={persona}
          scenario={scenario}
          tension={tension}
          onMenu={() => setRailOpen(true)}
          onChoose={startSession}
        />

        {reviewing ? (
          <ReviewPanel
            persona={persona}
            scenario={scenario}
            color={color}
            turns={turns}
            onBack={() => setReviewing(false)}
            onRestart={() => startSession(sel.personaId, sel.scenarioId)}
          />
        ) : (
          <>
            <ChatLog items={items} personaName={persona.name} typing={busy} />
            <Composer value={draft} busy={busy} onChange={setDraft} onSend={send} onEnd={endAndReview} />
          </>
        )}
      </main>
    </div>
  );
}
