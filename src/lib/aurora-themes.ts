export const AURORA_THEME_STORAGE_KEY = "aurora-theme";
export const AURORA_THEME_EVENT = "aurora-theme-change";

export interface AuroraTheme {
  id: string;
  label: string;
  colorStops: [string, string, string];
}

export const AURORA_THEMES: AuroraTheme[] = [
  {
    id: "violet",
    label: "Violet",
    colorStops: ["#2e1065", "#A855F7", "#e9d5ff"],
  },
  {
    id: "emerald",
    label: "Emerald",
    colorStops: ["#064e3b", "#10b981", "#a7f3d0"],
  },
  {
    id: "ocean",
    label: "Ocean",
    colorStops: ["#0c1844", "#3b82f6", "#bfdbfe"],
  },
  {
    id: "sunset",
    label: "Sunset",
    colorStops: ["#431407", "#f97316", "#fed7aa"],
  },
  {
    id: "rose",
    label: "Rose",
    colorStops: ["#4c0519", "#f43f5e", "#fecdd3"],
  },
];

export const DEFAULT_AURORA_THEME_ID = AURORA_THEMES[0].id;

export function getAuroraTheme(id: string | null | undefined): AuroraTheme {
  return AURORA_THEMES.find((theme) => theme.id === id) ?? AURORA_THEMES[0];
}

export function readStoredAuroraThemeId(): string {
  if (typeof window === "undefined") {
    return DEFAULT_AURORA_THEME_ID;
  }

  return localStorage.getItem(AURORA_THEME_STORAGE_KEY) ?? DEFAULT_AURORA_THEME_ID;
}

export function writeStoredAuroraThemeId(id: string) {
  localStorage.setItem(AURORA_THEME_STORAGE_KEY, id);
  window.dispatchEvent(new CustomEvent(AURORA_THEME_EVENT, { detail: id }));
}
