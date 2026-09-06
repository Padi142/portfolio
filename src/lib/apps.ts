import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { renderMarkdown } from "@/lib/markdown";
import { getProjectTheme, type ProjectColorTheme } from "@/lib/project-color";

const APPS_DIR = path.join(process.cwd(), "public", "apps");

export interface AppMeta {
  slug: string;
  name: string;
  description: string;
  type?: string;
  technologies: string[];
  android?: string;
  ios?: string;
  web?: string;
  order: number;
}

export interface MobileApp extends AppMeta {
  content: string;
  html: string;
  color: ProjectColorTheme;
}

let appsCache: MobileApp[] | null = null;

function optionalString(value: unknown): string | undefined {
  if (value == null || value === false) return undefined;
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = trimmed.toLowerCase();
  if (normalized === "null" || normalized === "n/a" || normalized === "none" || normalized === "-") {
    return undefined;
  }

  return trimmed;
}

async function parseAppFile(file: string): Promise<MobileApp> {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(APPS_DIR, file), "utf-8");
  const { data, content } = matter(raw);

  if (!data.name || !data.description) {
    throw new Error(`App "${slug}" is missing required frontmatter: name, description`);
  }

  const trimmedContent = content.trim();

  return {
    slug,
    name: data.name,
    description: data.description,
    type: data.type,
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    android: optionalString(data.android),
    ios: optionalString(data.ios),
    web: optionalString(data.web),
    order: typeof data.order === "number" ? data.order : 999,
    content: trimmedContent,
    html: await renderMarkdown(trimmedContent),
    color: getProjectTheme(data.name),
  };
}

export async function getAllApps(): Promise<MobileApp[]> {
  if (import.meta.env.DEV) {
    appsCache = null;
  }

  if (appsCache) {
    return appsCache;
  }

  if (!fs.existsSync(APPS_DIR)) {
    appsCache = [];
    return appsCache;
  }

  const files = fs.readdirSync(APPS_DIR).filter((file) => file.endsWith(".md"));
  const apps = await Promise.all(files.map(parseAppFile));

  appsCache = apps.sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );

  return appsCache;
}

export async function getApp(slug: string): Promise<MobileApp | undefined> {
  const apps = await getAllApps();
  return apps.find((app) => app.slug === slug);
}
