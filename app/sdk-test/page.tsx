"use client";

import { useState } from "react";
import { archetypes } from "@/lib/personas/archetypes";

export default function SdkTestPage() {
  const [personaId, setPersonaId] = useState(Object.keys(archetypes)[0]);
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setReply(null);
      } else {
        setReply(data.reply);
      }
    } catch {
      setError("Failed to reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Persona SDK test</h1>

      <label className="flex flex-col gap-1 text-sm">
        Personality
        <select
          className="rounded border border-black/20 p-2 dark:border-white/20"
          value={personaId}
          onChange={(event) => setPersonaId(event.target.value)}
        >
          {Object.values(archetypes).map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.name}
            </option>
          ))}
        </select>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {reply && (
        <div className="rounded border border-black/10 bg-black/[.03] p-3 text-sm whitespace-pre-wrap dark:border-white/10 dark:bg-white/[.05]">
          {reply}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          className="rounded border border-black/20 p-2 text-sm dark:border-white/20"
          rows={3}
          placeholder="Say something to the persona..."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(event);
            }
          }}
        />
        <button
          type="submit"
          disabled={loading}
          className="self-start rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}
