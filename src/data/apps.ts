export interface LabApp {
  id: string;
  name: string;
  category: string;
  url: string;
  description: string;
  tags: string[];
  embeddable: boolean;
  mediaId?: string;
}

const OWN_HOSTS = [
  "synthetix-labz.cloud",
  "webcraftstudio.cloud",
  "lightsouttattoo.site",
  "winchesterwebsolutions.net",
  "pages.dev",
];

function hostMatches(hostname: string, root: string) {
  return hostname === root || hostname.endsWith(`.${root}`);
}

export function absoluteUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/+/, "")}`;
}

export function allowsEmbed(url: string) {
  try {
    const hostname = new URL(absoluteUrl(url)).hostname.toLowerCase();
    const blocked =
      hostMatches(hostname, "ai.studio") ||
      hostMatches(hostname, "aistudio.google.com") ||
      hostMatches(hostname, "run.app") ||
      hostMatches(hostname, "github.com");
    if (blocked) return false;
    return OWN_HOSTS.some((root) => hostMatches(hostname, root));
  } catch {
    return false;
  }
}

export function projectEmbeds(app: Pick<LabApp, "url" | "embeddable">) {
  return app.embeddable && allowsEmbed(app.url);
}

export const seedProjects: LabApp[] = [
  {
    id: "lights-out",
    name: "Lights Out Tattoo",
    category: "Studio",
    url: "https://lightsouttattoo.site/",
    description:
      "Studio PWA with booking, portfolio galleries, and digital client consent. Founded and hosted for high-reliability mobile viewing.",
    tags: ["booking", "gallery", "pwa"],
    embeddable: true,
  },
  {
    id: "aura",
    name: "Aura Sanctuary",
    category: "Aura",
    url: "https://webcraftstudio.cloud/",
    description:
      "Neural audio Bible and social sanctuary. Prayer wall, community, and Gemini neural text-to-speech in a production PWA.",
    tags: ["tts", "social", "pwa"],
    embeddable: true,
  },
  {
    id: "winchester-express",
    name: "Winchester Express",
    category: "Logistics / Rideshare",
    url: "https://winchester-express.pages.dev",
    description: "Logistics and freight dispatch web portal.",
    tags: ["rideshare", "dispatch", "delivery"],
    embeddable: true,
  },
  {
    id: "promptsite",
    name: "PromptSite",
    category: "Lab",
    url: "https://promptsite-65l.pages.dev",
    description: "Multi-site generator interface connected to backend provisioners.",
    tags: ["llm", "generator", "live"],
    embeddable: true,
  },
  {
    id: "key-tex",
    name: "The Key Tex",
    category: "Field",
    url: "https://south-plains.webcraftstudio.cloud/",
    description:
      "Automotive locksmith suite: VIN and FCC ID scanning, key specs, LockCode bitting, and wholesale ordering.",
    tags: ["vin", "locksmith", "pwa"],
    embeddable: true,
  },
  {
    id: "winchester-web",
    name: "Winchester Web Solutions",
    category: "Web Development",
    url: "https://winchester-web-solutions.pages.dev",
    description: "Web design and full-stack development studio portal.",
    tags: ["web", "hosting", "studio"],
    embeddable: true,
  },
  {
    id: "cdl",
    name: "CDL Pre-Trip Master",
    category: "Fleet",
    url: "https://cdl.winchesterwebsolutions.net/",
    description:
      "Class A pre-trip trainer with walk-around checklists, voice prompts, speech checks, and an air-brake test.",
    tags: ["cdl", "voice", "pwa"],
    embeddable: true,
  },
  {
    id: "fleetglide",
    name: "FleetGlide",
    category: "Fleet",
    url: "https://fleetglide.pages.dev",
    description: "Fleet tracking, dispatch, and compliance management platform.",
    tags: ["eld", "gps", "live"],
    embeddable: true,
  },
  {
    id: "winchester-roofing",
    name: "Winchester Roofing Solutions",
    category: "Trade Services",
    url: "https://winchester-roofing-solutions.pages.dev",
    description: "Roofing contractor services, estimates, and project showcase.",
    tags: ["roofing", "estimates", "trade"],
    embeddable: true,
  },
  {
    id: "roma",
    name: "Roma on the Go",
    category: "Food & Mobile Ordering",
    url: "https://roma-on-the-go.pages.dev",
    description: "Mobile food vendor ordering and menu showcase.",
    tags: ["food", "ordering", "mobile"],
    embeddable: true,
  },
  {
    id: "tiktok-generator",
    name: "TikTok Generator",
    category: "Content Automation / AI",
    url: "https://tiktok-generator-6tb.pages.dev",
    description: "Social video automation and script generation tool.",
    tags: ["tiktok", "video", "ai"],
    embeddable: true,
  },
];

export const apps = seedProjects;

export const categories = ["ALL", ...new Set(seedProjects.map((app) => app.category))];
