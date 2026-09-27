import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedProfile, type Profile } from "../data/profile";
import { deleteMedia, loadMedia, loadProfile, saveMedia, saveProfile, type MediaRecord } from "../lib/db";

interface ProfileApi {
  profile: Profile;
  media: MediaRecord[];
  urls: Record<string, string>;
  ready: boolean;
  saveProfile: (next: Profile) => Promise<void>;
  addMedia: (files: File[]) => Promise<MediaRecord[]>;
  removeMedia: (id: string) => Promise<void>;
  resetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileApi | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(seedProfile);
  const [media, setMedia] = useState<MediaRecord[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadProfile(), loadMedia()])
      .then(([nextProfile, nextMedia]) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setMedia(nextMedia);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const item of media) {
      next[item.id] = URL.createObjectURL(new Blob([item.data], { type: item.mime }));
    }
    setUrls(next);
    return () => {
      for (const url of Object.values(next)) URL.revokeObjectURL(url);
    };
  }, [media]);

  const api = useMemo<ProfileApi>(
    () => ({
      profile,
      media,
      urls,
      ready,
      async saveProfile(next) {
        setProfile(next);
        await saveProfile(next);
      },
      async addMedia(files) {
        const created: MediaRecord[] = [];
        for (const file of files) {
          const mime = file.type || "application/octet-stream";
          if (!mime.startsWith("image/") && !mime.startsWith("video/")) continue;
          const record: MediaRecord = {
            id: crypto.randomUUID(),
            name: file.name,
            mime,
            createdAt: Date.now(),
            data: await file.arrayBuffer(),
          };
          await saveMedia(record);
          created.push(record);
        }
        if (created.length) setMedia((current) => [...created, ...current]);
        return created;
      },
      async removeMedia(id) {
        await deleteMedia(id);
        setMedia((current) => current.filter((item) => item.id !== id));
        setProfile((current) => {
          const next = {
            ...current,
            projects: current.projects.map((project) =>
              project.mediaId === id ? { ...project, mediaId: undefined } : project,
            ),
          };
          void saveProfile(next);
          return next;
        });
      },
      async resetProfile() {
        const next = structuredClone(seedProfile);
        setProfile(next);
        await saveProfile(next);
      },
    }),
    [media, profile, ready, urls],
  );

  return <ProfileContext.Provider value={api}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile must be used inside ProfileProvider");
  return value;
}
