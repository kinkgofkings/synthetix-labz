import { absoluteUrl, allowsEmbed, type LabApp } from "../data/apps";
import { seedProfile, type Profile } from "../data/profile";

export interface MediaRecord {
  id: string;
  name: string;
  mime: string;
  createdAt: number;
  data: ArrayBuffer;
}

const DB_NAME = "synthetix-labz";
const DB_VERSION = 1;

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("media")) db.createObjectStore("media", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadProfile(): Promise<Profile> {
  const db = await openDb();
  const saved = await requestToPromise(db.transaction("kv").objectStore("kv").get("profile"));
  db.close();
  if (!saved || typeof saved !== "object") return structuredClone(seedProfile);
  const record = saved as Partial<Profile>;
  const merged = reconcileSavedProfile({
    ...structuredClone(seedProfile),
    ...record,
    skills: record.skills?.length ? record.skills : seedProfile.skills,
    roles: record.roles?.length ? record.roles : seedProfile.roles,
    projects: record.projects?.length ? record.projects : seedProfile.projects,
  });
  const projectsChanged = JSON.stringify(merged.projects) !== JSON.stringify(record.projects ?? []);
  const hubChanged = merged.hub !== record.hub;
  const emailChanged = merged.email !== record.email || merged.formEmail !== record.formEmail;
  if (projectsChanged || hubChanged || emailChanged) await saveProfile(merged);
  return merged;
}

const LEGACY_PROJECT_IDS: Record<string, string> = {
  "aura-voice": "winchester-express",
  "key-field": "winchester-web",
  hub: "roma",
};

function registryIsStale(projects: Array<LabApp & { frameable?: boolean }>) {
  const byId = new Map(seedProfile.projects.map((project) => [project.id, project]));
  return projects.some((project) => {
    const id = LEGACY_PROJECT_IDS[project.id] ?? project.id;
    const seed = byId.get(id);
    const url = project.url ?? "";
    const customLabSubdomain = /https?:\/\/(?!synthetix-labz\.cloud(?:\/|$))[^/\s]*synthetix-labz\.cloud/i.test(url);
    return (
      project.id === "aura-rtc" ||
      project.name === "Aura WebRTC" ||
      project.name === "Locksmith Field" ||
      project.name === "Synthetix Hub" ||
      project.name === "Aura.V.2 Voice" ||
      project.id === "key-field" ||
      project.id === "hub" ||
      project.id === "aura-voice" ||
      !url.startsWith("http") ||
      url.includes("ai.studio") ||
      url.includes("aistudio.google.com") ||
      url.includes("run.app") ||
      customLabSubdomain ||
      (Boolean(seed?.url.includes("pages.dev")) && url !== seed?.url)
    );
  });
}

function normalizeProject(project: LabApp & { frameable?: boolean }): LabApp {
  const flagged = typeof project.embeddable === "boolean" ? project.embeddable : Boolean(project.frameable);
  return {
    id: project.id,
    name: project.name,
    category: project.category,
    url: absoluteUrl(project.url),
    description: project.description,
    tags: project.tags,
    mediaId: project.mediaId,
    embeddable: flagged && allowsEmbed(project.url),
  };
}

function reconcileSavedProfile(saved: Profile): Profile {
  const savedProjects = saved.projects as Array<LabApp & { frameable?: boolean }>;
  const mediaById = new Map<string, string | undefined>();
  for (const project of savedProjects) {
    const nextId = LEGACY_PROJECT_IDS[project.id] ?? project.id;
    if (project.mediaId) mediaById.set(nextId, project.mediaId);
  }
  const seedIds = new Set(seedProfile.projects.map((project) => project.id));
  const extras = savedProjects.filter((project) => {
    const id = LEGACY_PROJECT_IDS[project.id] ?? project.id;
    return !seedIds.has(id) && project.id !== "aura-rtc" && project.name !== "Aura WebRTC";
  });
  const projects = registryIsStale(savedProjects)
    ? [
        ...seedProfile.projects.map((project) => ({ ...project, mediaId: mediaById.get(project.id) ?? project.mediaId })),
        ...extras.map((project) => normalizeProject(project)),
      ]
    : savedProjects.map((project) => normalizeProject(project));
  const hubUrl = saved.hub.includes("synthetix-labs.cloud") ? seedProfile.hub : saved.hub;
  const email = /^james@synthetix-labz\.com$/i.test(saved.email) ? seedProfile.email : saved.email;
  const formEmail = saved.formEmail.includes("synthetix-labz.com") ? seedProfile.formEmail : saved.formEmail;
  return { ...saved, hub: hubUrl || seedProfile.hub, email, formEmail, projects };
}

export async function saveProfile(profile: Profile) {
  const db = await openDb();
  await requestToPromise(db.transaction("kv", "readwrite").objectStore("kv").put(profile, "profile"));
  db.close();
}

export async function loadMedia(): Promise<MediaRecord[]> {
  const db = await openDb();
  const rows = await requestToPromise(db.transaction("media").objectStore("media").getAll());
  db.close();
  return (rows as MediaRecord[]).sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveMedia(record: MediaRecord) {
  const db = await openDb();
  await requestToPromise(db.transaction("media", "readwrite").objectStore("media").put(record));
  db.close();
}

export async function deleteMedia(id: string) {
  const db = await openDb();
  await requestToPromise(db.transaction("media", "readwrite").objectStore("media").delete(id));
  db.close();
}
