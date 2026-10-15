"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import type { CatalogArchetype } from "@/lib/practice/types";
import { ChevronIcon } from "./icons";

interface ArchetypePickerProps {
  catalog: CatalogArchetype[];
  archetype: CatalogArchetype;
  scenarioId: string;
  onPick: (personaId: string, scenarioId: string) => void;
}

export function ArchetypePicker({ catalog, archetype, scenarioId, onPick }: ArchetypePickerProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Close on outside click or Escape while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        switchRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    // Open with the current archetype's scenarios already showing.
    setExpanded(next ? archetype.id : null);
  }

  return (
    <div className="switch-wrap" ref={wrapRef}>
      <button
        type="button"
        ref={switchRef}
        className="switch"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <i className="dot" />
        <b>{archetype.name}</b>
        <ChevronIcon />
      </button>

      <div id={panelId} className={`picker${open ? " open" : ""}`} role="group" aria-label="Choose who you are practicing with">
        {catalog.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <div key={item.id} className={`pgroup${isOpen ? " open" : ""}`}>
              <button
                type="button"
                className="opt phead"
                aria-expanded={isOpen}
                style={{ "--d": item.color } as CSSProperties}
                onClick={() => setExpanded(isOpen ? null : item.id)}
              >
                <i className="dot" />
                <span>
                  <b>{item.name}</b>
                  <span className="blurb">{item.blurb}</span>
                </span>
                <ChevronIcon />
              </button>
              <div className="psub">
                <div>
                  {item.scenarios.map((scenario) => (
                    <button
                      type="button"
                      key={scenario.id}
                      className="sopt"
                      tabIndex={open && isOpen ? 0 : -1}
                      aria-current={item.id === archetype.id && scenario.id === scenarioId ? "true" : undefined}
                      onClick={() => {
                        onPick(item.id, scenario.id);
                        setOpen(false);
                        setExpanded(null);
                        switchRef.current?.focus();
                      }}
                    >
                      {scenario.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
