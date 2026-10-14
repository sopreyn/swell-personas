"use client";

import type { Persona } from "@/lib/personas/types";
import type { PracticeScenario } from "@/lib/ui/scenarios";
import type { TurnRecord } from "@/lib/ui/types";

interface Props {
  persona: Persona;
  scenario: PracticeScenario;
  color: string;
  turns: TurnRecord[];
  onBack: () => void;
  onRestart: () => void;
}

const FALLBACK_TIPS = [
  "Naming what you noticed, instead of what they did wrong, tends to land softer.",
  "A specific ask usually lands better than a general complaint.",
  "Reflecting their point back before responding can lower the temperature.",
  "A short pause before reacting gives the other person room to soften too.",
];

export default function ReviewPanel({ persona, scenario, color, turns, onBack, onRestart }: Props) {
  const spikes = turns.filter((t) => t.delta > 0);

  return (
    <div className="review">
      <div className="reviewInner">
        <div className="revTitle">Session review</div>
        <div className="revSub">
          {scenario.title} with {persona.name}
        </div>

        <div className="revChart">
          {turns.map((t) => (
            <div
              key={t.turn}
              className={"revBar" + (t.delta > 0 ? " spike" : "")}
              style={{ height: t.tensionAfter * 14 + 8, background: color }}
              title={`Tension ${t.tensionAfter} of 5`}
            />
          ))}
        </div>

        <div className="revFlagsHead">
          {spikes.length ? "Moments tension rose" : "Tension never spiked. Nicely held."}
        </div>
        {spikes.map((t, i) => (
          <div key={t.turn} className="revFlag">
            <p className="revQuote">&ldquo;{t.text}&rdquo;</p>
            <p className="revSugg">{t.coach || FALLBACK_TIPS[i % FALLBACK_TIPS.length]}</p>
          </div>
        ))}
      </div>

      <div className="reviewInner revActions">
        <button className="revBtn" onClick={onBack}>
          Back to session
        </button>
        <button className="revBtn primary" onClick={onRestart}>
          Start a new session
        </button>
      </div>
    </div>
  );
}
