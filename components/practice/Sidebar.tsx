import type { CSSProperties } from "react";
import { findArchetype } from "@/lib/practice/lookup";
import { describeUpdatedAt, type ConversationSummaryView, type SessionGroup } from "@/lib/practice/sessions";
import type { CatalogArchetype, PracticeUser } from "@/lib/practice/types";
import { PlusIcon, WaveMark } from "./icons";

interface SidebarProps {
  groups: SessionGroup[];
  activeId: string | null;
  catalog: CatalogArchetype[];
  user: PracticeUser;
  open: boolean;
  onNew: () => void;
  onSelect: (session: ConversationSummaryView) => void;
  onQuiz: () => void;
}

export function Sidebar({ groups, activeId, catalog, user, open, onNew, onSelect, onQuiz }: SidebarProps) {
  return (
    <aside className={`rail${open ? " open" : ""}`} id="practice-rail">
      <div className="brand">
        <WaveMark />
        <span>Swell</span>
      </div>

      <button type="button" className="new-session" onClick={onNew}>
        <PlusIcon />
        Start a practice session
      </button>

      <nav className="history" aria-label="Past sessions">
        {groups.length === 0 ? (
          <p className="history-empty">Your practice sessions will show up here once you send a message.</p>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="day">{group.label}</div>
              {group.items.map((session) => {
                const archetype = findArchetype(catalog, session.personaId);
                return (
                  <button
                    type="button"
                    key={session.id}
                    className="thread"
                    style={{ "--d": archetype?.color } as CSSProperties}
                    aria-current={session.id === activeId ? "true" : undefined}
                    onClick={() => onSelect(session)}
                  >
                    <i className="dot" />
                    <span>
                      <b>{session.title}</b>
                      <small>{describeUpdatedAt(session)}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </nav>

      <a
        className="you"
        href="#quiz"
        onClick={(event) => {
          event.preventDefault();
          onQuiz();
        }}
      >
        <div className="avatar">{user.initials}</div>
        <div>
          <b>{user.name}</b>
          <small>Your type: {user.personalityType} &middot; retake quiz</small>
        </div>
      </a>
    </aside>
  );
}
