import { useEffect } from "react";
import { projectEmbeds, type LabApp } from "../data/apps";
import { apps } from "../data/apps";

interface NavigatorProps {
  visible: LabApp[];
  activeId: string;
  onSelect: (id: string) => void;
}

function registryLabel(app: LabApp) {
  const index = apps.findIndex((entry) => entry.id === app.id);
  return String(index + 1).padStart(2, "0");
}

export function AppRail({ visible, activeId, onSelect }: NavigatorProps) {
  return (
    <nav
      aria-label="Project registry"
      className="hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto border border-lab/30 bg-panel/70 p-2 lg:flex"
    >
      <p className="px-2 py-1 text-[10px] tracking-[0.28em] text-mute">// REGISTRY</p>
      {visible.map((app) => {
        const active = app.id === activeId;
        return (
          <button
            key={app.id}
            type="button"
            onClick={() => onSelect(app.id)}
            aria-current={active ? "true" : undefined}
            className={`flex items-center gap-2 px-2 py-2 text-left ${
              active
                ? "border border-lab bg-lab/10 text-ink shadow-[0_0_16px_rgba(0,240,255,0.18)]"
                : "border border-transparent text-mute hover:border-lab/30 hover:text-ink"
            }`}
          >
            <span className="w-6 text-[11px] text-lab">{registryLabel(app)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs">{app.name}</span>
              <span className="block text-[10px] tracking-[0.16em]">{app.category.toUpperCase()}</span>
            </span>
            <span className={`text-[9px] tracking-[0.14em] ${projectEmbeds(app) ? "text-lab" : "text-alert"}`}>
              {projectEmbeds(app) ? "EMBED" : "EXT"}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function AppDock({ visible, activeId, onSelect }: NavigatorProps) {
  useEffect(() => {
    document.getElementById(`dock-${activeId}`)?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <div className="border border-lab/30 bg-panel/75">
      <div className="flex items-center justify-between px-3 pt-2">
        <p className="text-[10px] tracking-[0.28em] text-mute">// SWIPE DECK</p>
        <p className="text-[10px] tracking-[0.18em] text-mute">DRAG CHROME OR ARROWS</p>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 py-2 snap-x snap-mandatory">
        {visible.map((app) => {
          const active = app.id === activeId;
          return (
            <button
              id={`dock-${app.id}`}
              key={app.id}
              type="button"
              onClick={() => onSelect(app.id)}
              aria-current={active ? "true" : undefined}
              className={`snap-center shrink-0 border px-3 py-2 text-left ${
                active ? "border-lab bg-lab/10 text-ink" : "border-lab/25 text-mute hover:text-ink"
              }`}
            >
              <span className="block text-[10px] text-lab">{registryLabel(app)}</span>
              <span className="block max-w-36 truncate text-xs">{app.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
