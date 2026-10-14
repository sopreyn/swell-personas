"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { archetypes } from "@/lib/personas/archetypes";
import type { Persona } from "@/lib/personas/types";
import { scenariosFor } from "@/lib/ui/scenarios";
import type { PracticeScenario } from "@/lib/ui/scenarios";
import { personaColor } from "@/lib/ui/theme";

interface Props {
  persona: Persona;
  scenario: PracticeScenario;
  tension: number;
  onMenu: () => void;
  onChoose: (personaId: string, scenarioId: string) => void;
}

export default function TopBar({ persona, scenario, tension, onMenu, onChoose }: Props) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <header className="topbar">
      <div className="bar-left">
        <button className="menu-btn" onClick={onMenu} aria-label="Show sessions">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
            <path d="M2 4.5h13M2 8.5h13M2 12.5h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="scenario">
          {scenario.title} &middot; {scenario.setup}
        </div>
      </div>

      <div className="switch-wrap" ref={wrap}>
        <button
          className="switch"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => (open ? close() : setOpen(true))}
        >
          <i className="dot" />
          <b>{persona.name}</b>
          <svg className="chev" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className={"picker" + (open ? " open" : "")} role="listbox" aria-label="Choose who you are practicing with">
          {Object.values(archetypes).map((p) => (
            <div key={p.id} className={"pgroup" + (expanded === p.id ? " open" : "")}>
              <button
                className="opt phead"
                aria-expanded={expanded === p.id}
                style={{ "--d": personaColor(p.id) } as CSSProperties}
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
              >
                <i className="dot" />
                <span>
                  <b>{p.name}</b>
                  <p>{p.summary}</p>
                </span>
                <svg className="chev" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div className="psub">
                {scenariosFor(p.id).map((s) => (
                  <button
                    key={s.id}
                    className="sopt"
                    onClick={() => {
                      onChoose(p.id, s.id);
                      close();
                    }}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bar-right">
        <div className="tension">
          <span>Tension</span>
          <div className="bars" role="img" aria-label={`Tension level ${tension} of 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <i key={n} className={n <= tension ? "lit" : ""} />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
