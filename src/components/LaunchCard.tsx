import { ExternalLink, Terminal } from "lucide-react";
import { absoluteUrl, type LabApp } from "../data/apps";

function openStandaloneApp(url: string, name: string) {
  const href = absoluteUrl(url);
  const opened = window.open(
    href,
    name.replace(/[^a-zA-Z0-9]/g, ""),
    "width=440,height=880,resizable=yes,scrollbars=yes,status=no",
  );
  if (!opened) window.open(href, "_blank", "noopener,noreferrer");
}

function protocolLabel(url: string) {
  try {
    return new URL(absoluteUrl(url)).protocol.replace(":", "").toUpperCase();
  } catch {
    return "UNKNOWN";
  }
}

export function LaunchCard({ app, coverUrl, coverMime }: { app: LabApp; coverUrl?: string; coverMime?: string }) {
  const href = absoluteUrl(app.url);
  return (
    <div className="flex h-full items-center justify-center bg-void p-6">
      <article className="rise w-full max-w-lg border border-lab/50 bg-panel/90 p-6 shadow-[0_0_32px_rgba(0,240,255,0.16),0_0_24px_rgba(255,61,242,0.12)]">
        {coverUrl &&
          (coverMime?.startsWith("video/") ? (
            <video src={coverUrl} controls className="mb-4 h-40 w-full border border-lab/30 bg-black object-cover" />
          ) : (
            <img src={coverUrl} alt="" className="mb-4 h-40 w-full border border-lab/30 object-cover" />
          ))}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] tracking-[0.35em] text-lab">// SYSTEM DIAGNOSTICS</p>
          <p className="border border-alert/60 px-2 py-0.5 text-[10px] tracking-[0.18em] text-alert">STANDALONE / EXTERNAL</p>
        </div>
        <h2 className="mt-3 text-2xl text-ink">{app.name}</h2>
        <p className="mt-1 text-[11px] tracking-[0.28em] text-mute">{app.category.toUpperCase()}</p>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[10px] tracking-[0.16em]">
          <dt className="text-mute">PROTOCOL</dt>
          <dd className="text-lab">{protocolLabel(href)}</dd>
          <dt className="text-mute">STATUS</dt>
          <dd className="text-alert">STANDALONE / EXTERNAL</dd>
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-ink/90">{app.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {app.tags.map((tag) => (
            <li key={tag} className="border border-lab/30 px-2 py-0.5 text-[10px] tracking-[0.2em] text-lab">
              {tag.toUpperCase()}
            </li>
          ))}
        </ul>
        <p className="mt-5 truncate border border-lab/25 bg-void px-3 py-2 font-mono text-xs text-lab">{href}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openStandaloneApp(href, app.name)}
            className="inline-flex items-center gap-2 border border-lab bg-lab px-4 py-2 text-xs tracking-[0.22em] text-void hover:bg-transparent hover:text-lab"
          >
            LAUNCH SYSTEM
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => openStandaloneApp(href, app.name)}
            className="inline-flex items-center gap-2 border border-alert/70 px-4 py-2 text-xs tracking-[0.22em] text-alert hover:bg-alert hover:text-void"
          >
            OPEN TERMINAL
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </article>
    </div>
  );
}
