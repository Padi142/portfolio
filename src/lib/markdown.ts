import { marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";

const THEME = "tokyo-night";

const LANGS = [
  "astro",
  "bash",
  "css",
  "docker",
  "dockerfile",
  "go",
  "html",
  "java",
  "javascript",
  "js",
  "json",
  "jsx",
  "markdown",
  "md",
  "python",
  "rust",
  "sh",
  "shell",
  "sql",
  "svelte",
  "text",
  "ts",
  "tsx",
  "typescript",
  "yaml",
  "yml",
  "zsh",
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;
let configured = false;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...LANGS],
    });
  }
  return highlighterPromise;
}

function resolveLanguage(highlighter: Highlighter, lang?: string) {
  if (!lang) return "text";

  const normalized = lang.toLowerCase();
  const loaded = highlighter.getLoadedLanguages();

  if (loaded.includes(normalized)) {
    return normalized;
  }

  const aliases: Record<string, string> = {
    shell: "bash",
    sh: "bash",
    zsh: "bash",
    js: "javascript",
    ts: "typescript",
    md: "markdown",
    yml: "yaml",
    dockerfile: "docker",
  };

  const mapped = aliases[normalized];
  if (mapped && loaded.includes(mapped)) {
    return mapped;
  }

  return "text";
}

export async function configureMarkdown() {
  if (configured) return;

  const highlighter = await getHighlighter();

  marked.use({
    renderer: {
      code({ text, lang }) {
        const language = resolveLanguage(highlighter, lang);
        return highlighter.codeToHtml(text, {
          lang: language,
          theme: THEME,
        });
      },
    },
  });

  marked.setOptions({ breaks: true, gfm: true });
  configured = true;
}

export async function renderMarkdown(content: string): Promise<string> {
  await configureMarkdown();
  return marked.parse(content);
}
