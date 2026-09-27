import { seedProjects, type LabApp } from "./apps";

export interface SkillGroup {
  id: string;
  label: string;
  items: string;
}

export interface Role {
  id: string;
  org: string;
  title: string;
  place: string;
  dates: string;
  points: string;
}

export interface Profile {
  name: string;
  title: string;
  phone: string;
  email: string;
  formEmail: string;
  hub: string;
  location: string;
  summary: string;
  skills: SkillGroup[];
  roles: Role[];
  education: string;
  projects: LabApp[];
}

export const seedProfile: Profile = {
  name: "James Elton Coffman III",
  title: "Senior AI Software Engineer | Full-Stack & Systems Architect",
  phone: "(826) 255-0831",
  email: "james@synthetix-labz.cloud",
  formEmail: "james@synthetix-labz.cloud",
  hub: "https://synthetix-labz.cloud",
  location: "Winchester, VA",
  summary:
    "Senior AI software engineer and systems architect working in autonomous agent workflows, edge-ready progressive web apps, and cloud microservices. The production record spans neural text-to-speech, commercial telematics, rideshare dispatch, and field-service PWAs. The stack is TypeScript, React, Node.js, Python, and cloud operations, delivered as contract systems that stay up.",
  skills: [
    {
      id: "ai",
      label: "AI & Neural Media",
      items:
        "Gemini neural TTS, LLM orchestration, prompt chaining, autonomous agent runtimes, context caching, schema enforcement",
    },
    {
      id: "front",
      label: "Frontend & PWAs",
      items: "React 18, TypeScript, Vite, Tailwind CSS, service workers, offline sync, web manifests, WebRTC",
    },
    {
      id: "back",
      label: "Backend & Telematics",
      items: "Node.js, Express, Python, Supabase, PostgreSQL RLS, SQLite, REST, JSON-RPC, GPS, VIN and key decoders",
    },
    {
      id: "ops",
      label: "DevOps & Cloud",
      items: "AWS Lightsail and EC2, Nginx, Docker, PM2, SSL automation, Ubuntu Linux",
    },
  ],
  roles: [
    {
      id: "labz",
      org: "Synthetix Labz / Webcraft Studio",
      title: "Principal AI Solutions Architect",
      place: "Winchester, VA",
      dates: "2023 – Present",
      points:
        "Lead engineering and deployment of full-stack AI applications, headless generation pipelines, and high-performance PWAs.\nProvision hardened AWS Lightsail Ubuntu hosts with Nginx, PM2, and automated SSL, holding 99.9% uptime across client portals.\nBuild Python and REST pipelines for asset synthesis and multi-tenant software rollouts.",
    },
    {
      id: "deep",
      org: "Deep Rapid Consultants",
      title: "Senior DevOps & Full-Stack Engineer",
      place: "Dallas, TX",
      dates: "2021 – 2023",
      points:
        "Contract work on distributed JavaScript and TypeScript delivery, streamlining containerized microservices on AWS.\nStandardized Docker workflows and CI automation, cutting build failures and configuration drift by 35%.",
    },
  ],
  education:
    "Community College of Allegheny County — Pittsburgh, PA. Computer programming and systems logic.\nContinuous work in agentic AI engineering, high-concurrency Node.js, modern TypeScript, and Linux containers.",
  projects: seedProjects,
};

export type { LabApp };
