import { MAX_TENSION } from "@/lib/practice/types";

const LEVELS = Array.from({ length: MAX_TENSION }, (_, i) => i + 1);

export function TensionMeter({ tension }: { tension: number }) {
  return (
    <div className="tension">
      <span>Tension</span>
      <div className="bars" role="img" aria-label={`Tension level ${tension} of ${MAX_TENSION}`}>
        {LEVELS.map((level) => (
          <i key={level} className={level <= tension ? "lit" : undefined} />
        ))}
      </div>
    </div>
  );
}
