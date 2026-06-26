export interface ProjectColorTheme {
  accent: string;
  accentBright: string;
  auroraStops: [string, string, string];
  hint: string;
  glow: string;
}

const PROJECT_PALETTES: Array<Pick<ProjectColorTheme, "accent" | "accentBright" | "auroraStops">> = [
  {
    accent: "#a855f7",
    accentBright: "#c084fc",
    auroraStops: ["#2e1065", "#a855f7", "#e9d5ff"],
  },
  {
    accent: "#10b981",
    accentBright: "#34d399",
    auroraStops: ["#064e3b", "#10b981", "#a7f3d0"],
  },
  {
    accent: "#3b82f6",
    accentBright: "#60a5fa",
    auroraStops: ["#0c1844", "#3b82f6", "#bfdbfe"],
  },
  {
    accent: "#f97316",
    accentBright: "#fb923c",
    auroraStops: ["#431407", "#f97316", "#fed7aa"],
  },
  {
    accent: "#f43f5e",
    accentBright: "#fb7185",
    auroraStops: ["#4c0519", "#f43f5e", "#fecdd3"],
  },
  {
    accent: "#14b8a6",
    accentBright: "#2dd4bf",
    auroraStops: ["#042f2e", "#14b8a6", "#99f6e4"],
  },
  {
    accent: "#eab308",
    accentBright: "#facc15",
    auroraStops: ["#422006", "#ca8a04", "#fef08a"],
  },
  {
    accent: "#8b5cf6",
    accentBright: "#a78bfa",
    auroraStops: ["#2e1065", "#7c3aed", "#ddd6fe"],
  },
];

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function withAlpha(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getProjectTheme(name: string): ProjectColorTheme {
  const normalized = name.trim().toLowerCase();
  const palette = PROJECT_PALETTES[hashString(normalized) % PROJECT_PALETTES.length];

  return {
    ...palette,
    hint: withAlpha(palette.accent, 0.14),
    glow: withAlpha(palette.accent, 0.35),
  };
}
