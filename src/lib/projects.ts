import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { renderMarkdown } from "@/lib/markdown";
import { getProjectTheme, type ProjectColorTheme } from "@/lib/project-color";

const PROJECTS_DIR = path.join(process.cwd(), "public", "projects");

export interface ProjectMeta {
  slug: string;
  name: string;
  description: string;
  type?: string;
  technologies: string[];
  github?: string;
  link?: string;
  order: number;
}

export interface Project extends ProjectMeta {
  content: string;
  html: string;
  color: ProjectColorTheme;
}

let projectsCache: Project[] | null = null;

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

async function parseProjectFile(file: string): Promise<Project> {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf-8");
  const { data, content } = matter(raw);

  if (!data.name || !data.description) {
    throw new Error(`Project "${slug}" is missing required frontmatter: name, description`);
  }

  const trimmedContent = content.trim();

  return {
    slug,
    name: data.name,
    description: data.description,
    type: data.type,
    technologies: Array.isArray(data.technologies) ? data.technologies : [],
    github: optionalString(data.github),
    link: optionalString(data.link),
    order: typeof data.order === "number" ? data.order : 999,
    content: trimmedContent,
    html: await renderMarkdown(trimmedContent),
    color: getProjectTheme(data.name),
  };
}

export async function getAllProjects(): Promise<Project[]> {
  if (import.meta.env.DEV) {
    projectsCache = null;
  }

  if (projectsCache) {
    return projectsCache;
  }

  if (!fs.existsSync(PROJECTS_DIR)) {
    projectsCache = [];
    return projectsCache;
  }

  const files = fs.readdirSync(PROJECTS_DIR).filter((file) => file.endsWith(".md"));
  const projects = await Promise.all(files.map(parseProjectFile));

  projectsCache = projects.sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name),
  );

  return projectsCache;
}

export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getAllProjects();
  return projects.find((project) => project.slug === slug);
}
