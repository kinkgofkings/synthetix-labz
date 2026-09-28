import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText, Radio } from "lucide-react";
import { useProfile } from "./context/ProfileContext";
import { downloadCv } from "./lib/cv";
import { Logo } from "./components/Logo";
import { Splash } from "./components/Splash";
import { SparkField } from "./components/SparkField";
import { PhoneActions } from "./components/PhoneActions";
import { InstallModal } from "./components/InstallModal";
import { ContactForm } from "./components/ContactForm";
import { NovaMap } from "./components/NovaMap";
import { LiveBrowser } from "./components/LiveBrowser";
import { OperatorGate } from "./components/AdminConsole";
import hero from "../public/portraits/hero.jpg";
import profileA from "../public/portraits/profile-a.jpg";
import profileB from "../public/portraits/profile-b.jpg";

const ENTERED_KEY = "synthetix-entered";

function formatClock(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour12: false });
}

export default function App() {
  const { profile, media, urls } = useProfile();
  const [entered, setEntered] = useState(() => sessionStorage.getItem(ENTERED_KEY) === "1");
  const [activeId, setActiveId] = useState(profile.projects[0]?.id ?? "");
  const [reloads, setReloads] = useState<Record<string, number>>({});
  const [clock, setClock] = useState(() => formatClock(new Date()));
  const [operator, setOperator] = useState(false);

  const active = profile.projects.find((project) => project.id === activeId) ?? profile.projects[0];
  const activeIndex = Math.max(0, profile.projects.findIndex((project) => project.id === active?.id));

  useEffect(() => {
    if (active && active.id !== activeId) setActiveId(active.id);
  }, [active, activeId]);

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatClock(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (!profile.projects.length) return;
      const index = profile.projects.findIndex((project) => project.id === active?.id);
      const next = profile.projects[(index + delta + profile.projects.length) % profile.projects.length];
      setActiveId(next.id);
    },
    [active?.id, profile.projects],
  );

  useEffect(() => {
    if (!entered) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered, step]);

  const covers = useMemo(() => media.filter((item) => item.mime.startsWith("image/") || item.mime.startsWith("video/")), [media]);

  function enter() {
    sessionStorage.setItem(ENTERED_KEY, "1");
    setEntered(true);
  }

  return (
    <div className="relative min-h-dvh bg-void text-ink">
      <div className="hud-grid pointer-events-none fixed inset-0" />
      <div className="vignette" />
      <div className="scanlines" aria-hidden="true" />
      {entered && <SparkField />}
      {!entered && <Splash onEnter={enter} />}
      <InstallModal active={entered} />
      <OperatorGate open={operator} onClose={() => setOperator(false)} />

      <header className="sticky top-0 z-20 border-b border-lab/30 bg-void/85 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <Logo className="h-9 w-9" />
          <div>
            <p className="text-[10px] tracking-[0.42em] text-lab">SYNTHETIX</p>
            <p className="text-sm tracking-[0.16em]">LABZ</p>
          </div>
          <nav className="flex gap-3 text-[10px] tracking-[0.16em] text-mute">
            <a href="#work" className="hover:text-lab">WORK</a>
            <a href="#record" className="hover:text-lab">RECORD</a>
            <a href="#signal" className="hover:text-lab">SIGNAL</a>
            <a href="#contact" className="hover:text-lab">CONTACT</a>
          </nav>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 border border-lab/40 px-2 py-1 text-[10px] tracking-[0.16em] text-lab">
              <Radio className="h-3 w-3" aria-hidden="true" />
              {clock}
            </span>
            <a href="/resume.html" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 border border-lab px-2 py-1 text-[10px] tracking-[0.16em] text-lab hover:bg-lab hover:text-void">
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              VIEW CV
            </a>
            <button type="button" onClick={() => downloadCv(profile)} className="inline-flex items-center gap-1 border border-lab px-2 py-1 text-[10px] tracking-[0.16em] text-lab hover:bg-lab hover:text-void">
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              DOWNLOAD CV
            </button>
            <button type="button" onClick={() => setOperator(true)} className="border border-lab/40 px-2 py-1 text-[10px] tracking-[0.16em] text-mute hover:text-lab">
              OPERATOR
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col gap-12 px-4 py-8">
        <section className="grid items-center gap-6 lg:grid-cols-[280px_1fr]">
          <div className="relative">
            <img
              src={hero}
              alt={`Portrait of ${profile.name}`}
              className="aspect-[4/5] w-full border border-lab/50 object-cover shadow-[0_0_36px_rgba(0,240,255,0.22)]"
            />
            <span className="pointer-events-none absolute inset-2 border border-lab/30" />
          </div>
          <div>
            <p className="text-[10px] tracking-[0.35em] text-lab">{profile.location.toUpperCase()}</p>
            <h1 className="mt-2 text-3xl tracking-[0.04em] sm:text-5xl">{profile.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">{profile.title}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink">{profile.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <PhoneActions phone={profile.phone} />
              <a href={`mailto:${profile.email}`} className="text-lab hover:underline">{profile.email}</a>
              <a href={profile.hub} target="_blank" rel="noopener noreferrer" className="text-mute hover:text-lab">{profile.hub.replace(/^https:\/\//, "")}</a>
            </div>
            <div className="mt-5 flex gap-3">
              <img src={profileA} alt="" className="h-16 w-16 border border-lab/30 object-cover" />
              <img src={profileB} alt="" className="h-16 w-16 border border-lab/30 object-cover" />
            </div>
          </div>
        </section>

        <section id="work" className="flex min-h-[70vh] flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] tracking-[0.35em] text-lab">// LIVE SYSTEMS</p>
              <h2 className="text-xl tracking-[0.12em]">SWIPE THE FIELD</h2>
            </div>
            <p className="text-[10px] tracking-[0.16em] text-mute">DRAG THE CHROME · ARROWS</p>
          </div>
          {active && (
            <div className="flex min-h-[520px] flex-1">
              <LiveBrowser
                app={active}
                index={activeIndex}
                reloadKey={reloads[active.id] ?? 0}
                onPrev={() => step(-1)}
                onNext={() => step(1)}
                onReload={() =>
                  setReloads((current) => ({ ...current, [active.id]: (current[active.id] ?? 0) + 1 }))
                }
              />
            </div>
          )}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {profile.projects.map((project, index) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveId(project.id)}
                aria-current={project.id === active?.id ? "true" : undefined}
                className={`snap-center shrink-0 border px-3 py-2 text-left ${
                  project.id === active?.id ? "border-lab bg-lab/10 text-ink" : "border-lab/25 text-mute"
                }`}
              >
                <span className="block text-[10px] text-lab">{String(index + 1).padStart(2, "0")}</span>
                <span className="block max-w-40 truncate text-xs">{project.name}</span>
              </button>
            ))}
          </div>
        </section>

        {covers.length > 0 && (
          <section>
            <p className="text-[10px] tracking-[0.35em] text-lab">// FIELD MEDIA</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {covers.map((item) =>
                item.mime.startsWith("video/") ? (
                  <video key={item.id} src={urls[item.id]} controls className="h-48 w-full border border-lab/30 bg-black object-cover" />
                ) : (
                  <img key={item.id} src={urls[item.id]} alt={item.name} className="h-48 w-full border border-lab/30 object-cover" />
                ),
              )}
            </div>
          </section>
        )}

        <section id="record" className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-lab">// COMPETENCE</p>
            <ul className="mt-4 grid gap-3">
              {profile.skills.map((group) => (
                <li key={group.id} className="border border-lab/25 bg-panel/70 p-4">
                  <h3 className="text-xs tracking-[0.18em] text-lab">{group.label.toUpperCase()}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink">{group.items}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid gap-6">
            <div>
              <p className="text-[10px] tracking-[0.35em] text-lab">// EXPERIENCE</p>
              <ul className="mt-4 grid gap-4">
                {profile.roles.map((role) => (
                  <li key={role.id} className="border-l-2 border-lab pl-4">
                    <h3 className="text-sm">{role.title}</h3>
                    <p className="text-xs tracking-[0.12em] text-mute">
                      {role.org} · {role.place} · {role.dates}
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm text-ink">
                      {role.points
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.35em] text-lab">// FOUNDATION</p>
              {profile.education
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => (
                  <p key={line} className="mt-2 text-sm leading-relaxed text-ink">{line}</p>
                ))}
            </div>
          </div>
        </section>

        <section id="signal">
          <p className="text-[10px] tracking-[0.35em] text-lab">// NORTHERN VIRGINIA</p>
          <h2 className="mt-2 text-xl tracking-[0.12em]">OPERATING RADIUS</h2>
          <p className="mt-2 max-w-2xl text-sm text-mute">
            Winchester sits at the center of a cyan target across the northern Virginia corridor. Pan and zoom to read the towns inside the 28 mile radius.
          </p>
          <div className="mt-4">
            <NovaMap />
          </div>
        </section>

        <section id="contact" className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-lab">// CONTACT</p>
            <h2 className="mt-2 text-xl tracking-[0.12em]">OPEN A CHANNEL</h2>
            <p className="mt-3 text-sm text-mute">
              The form delivers to {profile.formEmail}. The number opens a call or a text.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <PhoneActions phone={profile.phone} />
              <a href={`mailto:${profile.email}`} className="text-lab">{profile.email}</a>
              <p className="text-mute">{profile.location}</p>
            </div>
          </div>
          <ContactForm />
        </section>
      </main>
    </div>
  );
}
