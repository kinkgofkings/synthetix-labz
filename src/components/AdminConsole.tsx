import { useState, type FormEvent } from "react";
import { LogOut, Trash2, Upload, X } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { hasOperatorSession, operatorEmail, signIn, signOut } from "../lib/auth";
import { allowsEmbed, type LabApp } from "../data/apps";
import type { Profile } from "../data/profile";

export function OperatorGate({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [authed, setAuthed] = useState(hasOperatorSession);
  if (!open) return null;
  if (!authed) {
    return (
      <LoginDialog
        onClose={onClose}
        onSuccess={() => setAuthed(true)}
      />
    );
  }
  return (
    <AdminConsole
      onClose={() => {
        setAuthed(hasOperatorSession());
        onClose();
      }}
    />
  );
}

function LoginDialog({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState(operatorEmail());
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    const ok = await signIn(email, password);
    if (!ok) {
      setError("Those credentials do not open the operator console.");
      return;
    }
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4">
      <form onSubmit={(event) => void submit(event)} className="w-full max-w-md border border-lab/50 bg-void p-5 shadow-[0_0_36px_rgba(0,240,255,0.25)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm tracking-[0.28em] text-lab">OPERATOR LOGIN</h2>
          <button type="button" onClick={onClose} aria-label="Close login" className="text-mute hover:text-lab">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mt-4 grid gap-1 text-[10px] tracking-[0.18em] text-mute">
          EMAIL
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            className="border border-lab/30 bg-panel px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
          />
        </label>
        <label className="mt-3 grid gap-1 text-[10px] tracking-[0.18em] text-mute">
          PASSWORD
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="border border-lab/30 bg-panel px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
          />
        </label>
        {error && <p className="mt-3 text-xs text-alert">{error}</p>}
        <button type="submit" className="mt-4 w-full bg-lab px-3 py-2 text-xs tracking-[0.22em] text-void">
          ENTER CONSOLE
        </button>
      </form>
    </div>
  );
}

function AdminConsole({ onClose }: { onClose: () => void }) {
  const { profile, media, urls, saveProfile, addMedia, removeMedia, resetProfile } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [saved, setSaved] = useState("");
  const [selected, setSelected] = useState(draft.projects[0]?.id ?? "");

  const project = draft.projects.find((item) => item.id === selected) ?? draft.projects[0];
  const [tagDraft, setTagDraft] = useState<{ id: string; text: string } | null>(null);
  const tagText = tagDraft?.id === project?.id ? tagDraft.text : (project?.tags.join(", ") ?? "");

  function updateProject(id: string, patch: Partial<LabApp>) {
    setDraft((current) => ({
      ...current,
      projects: current.projects.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  async function commit() {
    await saveProfile(draft);
    setSaved("Saved on this device.");
  }

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-void/95 p-4 text-ink">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <header className="flex flex-wrap items-center gap-3 border border-lab/40 bg-panel p-3">
          <h2 className="text-sm tracking-[0.28em] text-lab">OPERATOR CONSOLE</h2>
          <p className="text-[10px] tracking-[0.16em] text-mute">EDITS STAY IN THIS BROWSER</p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={() => void commit()} className="bg-lab px-3 py-2 text-[10px] tracking-[0.18em] text-void">
              SAVE
            </button>
            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="inline-flex items-center gap-1 border border-lab/40 px-3 py-2 text-[10px] tracking-[0.16em] text-lab"
            >
              <LogOut className="h-3.5 w-3.5" />
              LOCK
            </button>
          </div>
        </header>
        {saved && <p className="text-xs text-lab">{saved}</p>}

        <section className="grid gap-3 border border-lab/30 p-4 md:grid-cols-2">
          <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <Field label="Title" value={draft.title} onChange={(title) => setDraft({ ...draft, title })} />
          <Field label="Phone" value={draft.phone} onChange={(phone) => setDraft({ ...draft, phone })} />
          <Field label="Public email" value={draft.email} onChange={(email) => setDraft({ ...draft, email })} />
          <Field label="Form inbox" value={draft.formEmail} onChange={(formEmail) => setDraft({ ...draft, formEmail })} />
          <Field label="Location" value={draft.location} onChange={(location) => setDraft({ ...draft, location })} />
          <Field label="Hub URL" value={draft.hub} onChange={(hub) => setDraft({ ...draft, hub })} />
          <label className="grid gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
            SUMMARY
            <textarea
              value={draft.summary}
              onChange={(event) => setDraft({ ...draft, summary: event.target.value })}
              rows={4}
              className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none"
            />
          </label>
          <label className="grid gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
            EDUCATION
            <textarea
              value={draft.education}
              onChange={(event) => setDraft({ ...draft, education: event.target.value })}
              rows={3}
              className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none"
            />
          </label>
        </section>

        <section className="border border-lab/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[10px] tracking-[0.22em] text-lab">PROJECTS</h3>
            <button
              type="button"
              onClick={() => {
                const id = crypto.randomUUID();
                const next: LabApp = {
                  id,
                  name: "New project",
                  category: "Lab",
                  url: "https://",
                  description: "",
                  tags: ["live"],
                  embeddable: false,
                };
                setDraft((current) => ({ ...current, projects: [...current.projects, next] }));
                setSelected(id);
              }}
              className="border border-lab/40 px-2 py-1 text-[10px] tracking-[0.16em] text-lab"
            >
              ADD
            </button>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {draft.projects.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                className={`shrink-0 border px-2 py-1 text-xs ${item.id === project?.id ? "border-lab text-lab" : "border-lab/20 text-mute"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {project && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Field label="Project name" value={project.name} onChange={(name) => updateProject(project.id, { name })} />
              <Field label="Category" value={project.category} onChange={(category) => updateProject(project.id, { category })} />
              <label className="grid min-w-0 gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
                URL
                <textarea
                  value={project.url}
                  rows={2}
                  spellCheck={false}
                  onChange={(event) => updateProject(project.id, { url: event.target.value })}
                  className="w-full min-w-0 break-all border border-lab/30 bg-void px-3 py-2 font-mono text-sm tracking-normal text-ink outline-none focus:border-lab"
                />
              </label>
              <label className="grid min-w-0 gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
                TAGS
                <input
                  value={tagText}
                  onChange={(event) => {
                    const text = event.target.value;
                    setTagDraft({ id: project.id, text });
                    updateProject(project.id, {
                      tags: text
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    });
                  }}
                  className="w-full min-w-0 border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
                />
                <span className="tracking-normal">Comma-separated.</span>
              </label>
              <label className="grid gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
                DESCRIPTION
                <textarea
                  value={project.description}
                  onChange={(event) => updateProject(project.id, { description: event.target.value })}
                  rows={4}
                  className="w-full min-w-0 border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-ink">
                <input
                  type="checkbox"
                  checked={project.embeddable && allowsEmbed(project.url)}
                  disabled={!allowsEmbed(project.url)}
                  onChange={(event) => updateProject(project.id, { embeddable: event.target.checked && allowsEmbed(project.url) })}
                />
                Embed in the live viewer
              </label>
              <div className="grid gap-2 md:col-span-2">
                <p className="text-[10px] tracking-[0.16em] text-mute">COVER MEDIA</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative inline-flex cursor-pointer items-center gap-2 border border-lab px-3 py-2 text-[10px] tracking-[0.16em] text-lab">
                    <Upload className="h-3.5 w-3.5" />
                    UPLOAD FROM THIS DEVICE
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (!file || !project) return;
                        const projectId = project.id;
                        void addMedia([file]).then((created) => {
                          const record = created[0];
                          if (!record) return;
                          setDraft((current) => {
                            const next = {
                              ...current,
                              projects: current.projects.map((item) =>
                                item.id === projectId ? { ...item, mediaId: record.id } : item,
                              ),
                            };
                            void saveProfile(next);
                            return next;
                          });
                          setSaved("Cover saved with this project on this device.");
                        });
                      }}
                    />
                  </label>
                  {project.mediaId && (
                    <button
                      type="button"
                      onClick={() => updateProject(project.id, { mediaId: undefined })}
                      className="border border-alert/50 px-3 py-2 text-[10px] tracking-[0.16em] text-alert"
                    >
                      CLEAR COVER
                    </button>
                  )}
                </div>
                <p className="text-xs tracking-normal text-mute">Opens the photo library, files, or camera on this device.</p>
                {project.mediaId && urls[project.mediaId] && (
                  media.find((item) => item.id === project.mediaId)?.mime.startsWith("video/") ? (
                    <video src={urls[project.mediaId]} controls className="h-40 w-full max-w-sm border border-lab/30 bg-black object-cover" />
                  ) : (
                    <img src={urls[project.mediaId]} alt="" className="h-40 w-full max-w-sm border border-lab/30 object-cover" />
                  )
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraft((current) => ({
                    ...current,
                    projects: current.projects.filter((item) => item.id !== project.id),
                  }));
                  setSelected("");
                }}
                className="inline-flex w-fit items-center gap-1 border border-alert/50 px-2 py-1 text-[10px] tracking-[0.16em] text-alert"
              >
                <Trash2 className="h-3.5 w-3.5" />
                DELETE PROJECT
              </button>
            </div>
          )}
        </section>

        <section className="border border-lab/30 p-4">
          <h3 className="text-[10px] tracking-[0.22em] text-lab">ROLES AND SKILLS</h3>
          <div className="mt-3 grid gap-3">
            {draft.roles.map((role) => (
              <div key={role.id} className="grid gap-2 border border-lab/20 p-3 md:grid-cols-2">
                <Field
                  label="Organization"
                  value={role.org}
                  onChange={(org) =>
                    setDraft({ ...draft, roles: draft.roles.map((item) => (item.id === role.id ? { ...item, org } : item)) })
                  }
                />
                <Field
                  label="Title"
                  value={role.title}
                  onChange={(title) =>
                    setDraft({ ...draft, roles: draft.roles.map((item) => (item.id === role.id ? { ...item, title } : item)) })
                  }
                />
                <Field
                  label="Place"
                  value={role.place}
                  onChange={(place) =>
                    setDraft({ ...draft, roles: draft.roles.map((item) => (item.id === role.id ? { ...item, place } : item)) })
                  }
                />
                <Field
                  label="Dates"
                  value={role.dates}
                  onChange={(dates) =>
                    setDraft({ ...draft, roles: draft.roles.map((item) => (item.id === role.id ? { ...item, dates } : item)) })
                  }
                />
                <label className="grid gap-1 text-[10px] tracking-[0.16em] text-mute md:col-span-2">
                  POINTS
                  <textarea
                    value={role.points}
                    onChange={(event) =>
                      setDraft({
                        ...draft,
                        roles: draft.roles.map((item) => (item.id === role.id ? { ...item, points: event.target.value } : item)),
                      })
                    }
                    rows={3}
                    className="border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none"
                  />
                </label>
              </div>
            ))}
            {draft.skills.map((group) => (
              <Field
                key={group.id}
                label={group.label}
                value={group.items}
                onChange={(items) =>
                  setDraft({
                    ...draft,
                    skills: draft.skills.map((item) => (item.id === group.id ? { ...item, items } : item)),
                  })
                }
              />
            ))}
          </div>
        </section>

        <section className="border border-lab/30 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[10px] tracking-[0.22em] text-lab">MEDIA UPLOADS</h3>
            <label className="relative inline-flex cursor-pointer items-center gap-2 border border-lab px-3 py-2 text-[10px] tracking-[0.16em] text-lab">
              <Upload className="h-3.5 w-3.5" />
              UPLOAD IMAGES OR VIDEO
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                onChange={(event) => {
                  const files = [...(event.target.files ?? [])];
                  if (files.length) void addMedia(files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {media.map((item) => (
              <li key={item.id} className="border border-lab/20 p-2">
                {item.mime.startsWith("video/") ? (
                  <video src={urls[item.id]} controls className="h-32 w-full bg-black object-cover" />
                ) : (
                  <img src={urls[item.id]} alt={item.name} className="h-32 w-full object-cover" />
                )}
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-mute">{item.name}</p>
                  <button type="button" onClick={() => void removeMedia(item.id)} aria-label={`Delete ${item.name}`} className="text-alert">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {media.length === 0 && <p className="mt-3 text-xs text-mute">No uploads yet. Files stay on this device.</p>}
        </section>

        <button
          type="button"
          onClick={() => {
            if (window.confirm("Restore the original resume and project list?")) void resetProfile().then(() => onClose());
          }}
          className="w-fit border border-alert/40 px-3 py-2 text-[10px] tracking-[0.16em] text-alert"
        >
          RESET TO RESUME DEFAULTS
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-1 text-[10px] tracking-[0.16em] text-mute">
      {label.toUpperCase()}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 border border-lab/30 bg-void px-3 py-2 text-sm tracking-normal text-ink outline-none focus:border-lab"
      />
    </label>
  );
}
