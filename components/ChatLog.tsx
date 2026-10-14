"use client";

import { useEffect, useRef } from "react";
import type { ChatItem } from "@/lib/ui/types";

interface Props {
  items: ChatItem[];
  personaName: string;
  typing: boolean;
}

export default function ChatLog({ items, personaName, typing }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items, typing]);

  return (
    <div className="log" ref={ref}>
      <div className="stream">
        {items.map((m) => {
          if (m.kind === "note") {
            return (
              <div key={m.id} className="setup">
                {m.lines[0]}
              </div>
            );
          }
          if (m.kind === "me") {
            return (
              <div key={m.id} className="msg me">
                {m.lines[0]}
              </div>
            );
          }
          return (
            <div key={m.id} className="msg them">
              <div className="who">{personaName}</div>
              {m.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          );
        })}
        {typing && (
          <div className="msg them">
            <div className="who">{personaName}</div>
            <div className="typing">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
