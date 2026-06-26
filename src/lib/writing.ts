import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { renderMarkdown } from "@/lib/markdown";
import { getProjectTheme, type ProjectColorTheme } from "@/lib/project-color";

const WRITING_DIR = path.join(process.cwd(), "public", "writing");

export interface WritingMeta {
  slug: string;
  title: string;
  description: string;
  category?: string;
  date?: string;
  link?: string;
  order: number;
}

export interface WritingArticle extends WritingMeta {
  content: string;
  html: string;
  color: ProjectColorTheme;
}

let writingCache: WritingArticle[] | null = null;

function optionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function parseWritingFile(file: string): Promise<WritingArticle> {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(WRITING_DIR, file), "utf-8");
  const { data, content } = matter(raw);

  if (!data.title || !data.description) {
    throw new Error(`Writing "${slug}" is missing required frontmatter: title, description`);
  }

  const trimmedContent = content.trim();

  return {
    slug,
    title: data.title,
    description: data.description,
    category: optionalString(data.category),
    date: optionalString(data.date),
    link: optionalString(data.link),
    order: typeof data.order === "number" ? data.order : 999,
    content: trimmedContent,
    html: await renderMarkdown(trimmedContent),
    color: getProjectTheme(data.title),
  };
}

export async function getAllWriting(): Promise<WritingArticle[]> {
  if (import.meta.env.DEV) {
    writingCache = null;
  }

  if (writingCache) {
    return writingCache;
  }

  if (!fs.existsSync(WRITING_DIR)) {
    writingCache = [];
    return writingCache;
  }

  const files = fs.readdirSync(WRITING_DIR).filter((file) => file.endsWith(".md"));
  const articles = await Promise.all(files.map(parseWritingFile));

  writingCache = articles.sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );

  return writingCache;
}

export async function getWritingArticle(slug: string): Promise<WritingArticle | undefined> {
  const articles = await getAllWriting();
  return articles.find((article) => article.slug === slug);
}
