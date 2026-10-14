"use client";

import { useEffect, type KeyboardEvent, type RefObject } from "react";
import { ArrowUpIcon } from "./icons";

interface ComposerProps {
  value: string;
  busy: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
  onSend: () => void;
  onEnd: () => void;
}

export function Composer({ value, busy, inputRef, onChange, onSend, onEnd }: ComposerProps) {
  // Grow with the text, between one line and about six.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(40, Math.min(el.scrollHeight, 160))}px`;
  }, [value, inputRef]);

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSend();
    }
  }

  const canSend = value.trim().length > 0 && !busy;

  return (
    <div className="composer">
      <div className="composer-inner">
        <div className="box">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            placeholder="Say what you would actually say..."
            aria-label="Your message"
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="send" aria-label="Send" disabled={!canSend} onClick={onSend}>
            <ArrowUpIcon />
          </button>
        </div>
        <div className="hint">
          <p>Nothing here is graded. You can restart a scenario any time.</p>
          <button type="button" onClick={onEnd}>
            End and review
          </button>
        </div>
      </div>
    </div>
  );
}
