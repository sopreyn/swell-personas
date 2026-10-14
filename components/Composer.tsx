"use client";

import { useEffect, useRef } from "react";

interface Props {
  value: string;
  busy: boolean;
  onChange: (v: string) => void;
  onSend: () => void;
  onEnd: () => void;
}

export default function Composer({ value, busy, onChange, onSend, onEnd }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow between 40px and 160px.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.max(40, Math.min(el.scrollHeight, 160)) + "px";
  }, [value]);

  return (
    <div className="composer">
      <div className="inner">
        <div className="box">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            placeholder="Say what you would actually say..."
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button className="send" aria-label="Send" disabled={!value.trim() || busy} onClick={onSend}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="hint">
          <p>Nothing here is graded. You can restart a scenario any time.</p>
          <button onClick={onEnd}>End and review</button>
        </div>
      </div>
    </div>
  );
}
