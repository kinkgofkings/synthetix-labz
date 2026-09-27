import { useEffect, useState, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";
import { absoluteUrl, projectEmbeds, type LabApp } from "../data/apps";
import { useProfile } from "../context/ProfileContext";
import { LaunchCard } from "./LaunchCard";

interface LiveBrowserProps {
  app: LabApp;
  index: number;
  reloadKey: number;
  onPrev: () => void;
  onNext: () => void;
  onReload: () => void;
}

export function LiveBrowser({ app, index, reloadKey, onPrev, onNext, onReload }: LiveBrowserProps) {
  const { media, urls } = useProfile();
  const cover = media.find((item) => item.id === app.mediaId);
  const coverUrl = cover ? urls[cover.id] : undefined;
  const href = absoluteUrl(app.url);
  const embeds = projectEmbeds({ ...app, url: href });
  const [offset, setOffset] = useState(0);
  const [origin, setOrigin] = useState<number | null>(null);
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    setLinked(false);
    setOffset(0);
  }, [app.id, reloadKey]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setOrigin(event.clientX);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setOffset(event.clientX - origin);
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (origin === null) return;
    const delta = event.clientX - origin;
    setOrigin(null);
    setOffset(0);
    if (delta <= -56) onNext();
    else if (delta >= 56) onPrev();
  }

  return (
    <section
      className="rise flex min-h-0 min-w-0 flex-1 flex-col border border-lab/40 bg-panel/80 shadow-[0_0_28px_rgba(0,240,255,0.12)]"
      style={{ transform: `translateX(${offset}px)` }}
      aria-label={`${app.name} live view`}
    >
      <div
        className="cursor-grab touch-none border-b border-lab/30 bg-void/80 active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setOrigin(null);
          setOffset(0);
        }}
      >
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="text-xs text-lab">{String(index + 1).padStart(2, "0")}</span>
          <h2 className="truncate text-sm text-ink">{app.name}</h2>
          <span className="border border-lab/40 px-1.5 py-0.5 text-[10px] tracking-[0.18em] text-lab">
            {app.category.toUpperCase()}
          </span>
          <span
            className={`ml-auto border px-1.5 py-0.5 text-[10px] tracking-[0.18em] ${
              embeds ? "border-lab/50 text-lab" : "border-alert/60 text-alert"
            }`}
          >
            {embeds ? "EMBED" : "STANDALONE / EXTERNAL"}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 pb-2">
          <button
            type="button"
            onClick={onPrev}
            className="border border-lab/40 p-1.5 text-lab hover:bg-lab hover:text-void"
            aria-label="Previous project"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <input
            readOnly
            value={href}
            aria-label="Current uplink"
            className="min-w-0 flex-1 border border-lab/30 bg-void px-3 py-1.5 text-xs text-lab outline-none"
          />
          <button
            type="button"
            onClick={onReload}
            className="border border-lab/40 p-1.5 text-lab hover:bg-lab hover:text-void"
            aria-label="Reload uplink"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-lab/40 p-1.5 text-lab hover:bg-lab hover:text-void"
            aria-label={`Launch ${app.name} outside the HUD`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={onNext}
            className="border border-lab/40 p-1.5 text-lab hover:bg-lab hover:text-void"
            aria-label="Next project"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 bg-void">
        {coverUrl && embeds && (
          cover?.mime.startsWith("video/") ? (
            <video src={coverUrl} controls className="h-36 w-full border-b border-lab/30 bg-black object-cover" />
          ) : (
            <img src={coverUrl} alt="" className="h-36 w-full border-b border-lab/30 object-cover" />
          )
        )}
        {embeds ? (
          <>
            {!linked && (
              <p className="pointer-events-none absolute inset-x-0 top-4 text-center text-[10px] tracking-[0.35em] text-lab">
                LINKING UPLINK
              </p>
            )}
            <iframe
              key={`${app.id}-${reloadKey}`}
              src={href}
              title={app.name}
              className="h-full w-full border-0 bg-void"
              referrerPolicy="no-referrer"
              allow="fullscreen; clipboard-write"
              onLoad={() => setLinked(true)}
            />
          </>
        ) : (
          <LaunchCard app={app} coverUrl={coverUrl} coverMime={cover?.mime} />
        )}
      </div>
    </section>
  );
}
