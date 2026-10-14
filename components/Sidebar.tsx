"use client";

import type { CSSProperties } from "react";
import { personaColor } from "@/lib/ui/theme";
import { SAMPLE_THREADS } from "@/lib/ui/threads";
import { CURRENT_USER } from "@/lib/ui/user";

interface Props {
  open: boolean;
  activeKey: string;
  onPick: (personaId: string, scenarioId: string) => void;
  onNew: () => void;
}

const QUIZ_URL = process.env.NEXT_PUBLIC_QUIZ_URL || "#";

export default function Sidebar({ open, activeKey, onPick, onNew }: Props) {
  return (
    <aside className={"rail" + (open ? " open" : "")}>
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path d="M2 13.5c2.6 0 2.6-4 5.2-4s2.6 4 5.2 4 2.6-4 5.2-4c1 0 1.6.6 2.2 1.3" stroke="#F1653D" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M2 18c2.6 0 2.6-3 5.2-3s2.6 3 5.2 3 2.6-3 5.2-3c1 0 1.6.4 2.2 1" stroke="#F4A73D" strokeWidth="1.7" strokeLinecap="round" opacity=".7" />
        </svg>
        <span>Swell</span>
      </div>

      <button className="new-session" onClick={onNew}>
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Start a practice session
      </button>

      <nav className="history" aria-label="Past sessions">
        {SAMPLE_THREADS.map((group) => (
          <div key={group.day}>
            <div className="day">{group.day}</div>
            {group.items.map((it) => {
              const key = it.personaId + ":" + it.scenarioId;
              return (
                <button
                  key={key}
                  className="thread"
                  aria-current={activeKey === key ? "true" : undefined}
                  style={{ "--d": personaColor(it.personaId) } as CSSProperties}
                  onClick={() => onPick(it.personaId, it.scenarioId)}
                >
                  <i className="dot" />
                  <span>
                    <b>{it.title}</b>
                    <small>{it.summary}</small>
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <a className="you" href={QUIZ_URL}>
        <div className="avatar">{CURRENT_USER.initials}</div>
        <div>
          <b>{CURRENT_USER.name}</b>
          <small>Your type: {CURRENT_USER.type} &middot; retake quiz</small>
        </div>
      </a>
    </aside>
  );
}
