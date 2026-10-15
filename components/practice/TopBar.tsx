import type { CatalogArchetype } from "@/lib/practice/types";
import { ArchetypePicker } from "./ArchetypePicker";
import { MenuIcon } from "./icons";
import { TensionMeter } from "./TensionMeter";

interface TopBarProps {
  catalog: CatalogArchetype[];
  archetype: CatalogArchetype;
  scenarioId: string;
  scenarioLine: string;
  tension: number;
  railOpen: boolean;
  onPick: (personaId: string, scenarioId: string) => void;
  onMenu: () => void;
}

export function TopBar({
  catalog,
  archetype,
  scenarioId,
  scenarioLine,
  tension,
  railOpen,
  onPick,
  onMenu,
}: TopBarProps) {
  return (
    <header className="topbar">
      <div className="bar-left">
        <button
          type="button"
          className="menu-btn"
          aria-label="Show sessions"
          aria-expanded={railOpen}
          aria-controls="practice-rail"
          onClick={onMenu}
        >
          <MenuIcon />
        </button>
        <div className="scenario" title={scenarioLine}>
          {scenarioLine}
        </div>
      </div>

      <ArchetypePicker catalog={catalog} archetype={archetype} scenarioId={scenarioId} onPick={onPick} />

      <div className="bar-right">
        <TensionMeter tension={tension} />
      </div>
    </header>
  );
}
