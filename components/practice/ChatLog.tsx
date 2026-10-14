"use client";

import { useEffect, useRef } from "react";
import type { PracticeMessage } from "@/lib/practice/types";

interface ChatLogProps {
  archetypeName: string;
  setup: string;
  messages: PracticeMessage[];
  busy: boolean;
  notice: string | null;
}

export function ChatLog({ archetypeName, setup, messages, busy, notice }: ChatLogProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Keep the newest line in view as the conversation grows. The first scroll after
  // mounting (opening or switching a session) jumps instead of animating.
  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: reduceMotion || !hasScrolled.current ? "auto" : "smooth",
    });
    hasScrolled.current = true;
  }, [messages.length, busy, notice]);

  return (
    <div className="log" ref={logRef}>
      <div className="stream" role="log" aria-live="polite" aria-relevant="additions">
        <div className="setup">{setup}</div>

        {messages.map((message) =>
          message.role === "assistant" ? (
            <div className="msg them" key={message.id}>
              <div className="who">{archetypeName}</div>
              {message.content
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
            </div>
          ) : (
            <div className="msg me" key={message.id}>
              {message.content}
            </div>
          ),
        )}

        {busy && (
          <div className="msg them" aria-label={`${archetypeName} is typing`}>
            <div className="who">{archetypeName}</div>
            <div className="typing" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
        )}

        {notice && <div className="setup notice">{notice}</div>}
      </div>
    </div>
  );
}
