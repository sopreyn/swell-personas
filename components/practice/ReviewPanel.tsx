import type { TurnRecord } from "@/lib/practice/types";

interface ReviewPanelProps {
  scenarioTitle: string;
  archetypeName: string;
  turns: TurnRecord[];
  suggestions: string[];
  loadingSuggestions: boolean;
  onBack: () => void;
  onRestart: () => void;
}

export function ReviewPanel({
  scenarioTitle,
  archetypeName,
  turns,
  suggestions,
  loadingSuggestions,
  onBack,
  onRestart,
}: ReviewPanelProps) {
  const spikes = turns.filter((turn) => turn.delta > 0);
  const peak = turns.length ? Math.max(...turns.map((t) => t.tensionAfter)) : 1;

  return (
    <div className="review">
      <div className="review-inner">
        <h2 className="rev-title">Session review</h2>
        <p className="rev-sub">
          {scenarioTitle} with {archetypeName}
        </p>

        <div
          className="rev-chart"
          role="img"
          aria-label={`Tension after each of your ${turns.length} messages, peaking at ${peak} of 5`}
        >
          {turns.map((turn) => (
            <div
              key={turn.turn}
              className={`rev-bar${turn.delta > 0 ? " spike" : ""}`}
              style={{ height: `${turn.tensionAfter * 14 + 8}px` }}
              title={`Message ${turn.turn + 1}: tension ${turn.tensionAfter} of 5`}
            />
          ))}
        </div>
        <p className="rev-caption">Tension after each of your messages. Brighter bars mark where it rose.</p>

        <h3 className="rev-flags-head">
          {spikes.length > 0 ? "Moments tension rose" : "Tension never spiked. Nicely held."}
        </h3>
        {spikes.map((turn, i) => (
          <div className="rev-flag" key={turn.turn}>
            <p className="rev-quote">&ldquo;{turn.text}&rdquo;</p>
            <p className={`rev-sugg${loadingSuggestions ? " loading" : ""}`}>{suggestions[i]}</p>
          </div>
        ))}
      </div>

      <div className="review-inner rev-actions">
        <button type="button" className="rev-btn" onClick={onBack}>
          Back to session
        </button>
        <button type="button" className="rev-btn primary" onClick={onRestart}>
          Start a new session
        </button>
      </div>
    </div>
  );
}
