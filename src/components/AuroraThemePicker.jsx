import { useEffect, useRef, useState } from "react";

import {
  AURORA_THEMES,
  AURORA_THEME_EVENT,
  getAuroraTheme,
  readStoredAuroraThemeId,
  writeStoredAuroraThemeId,
} from "@/lib/aurora-themes";

export default function AuroraThemePicker() {
  const rootRef = useRef(null);
  const [activeId, setActiveId] = useState(readStoredAuroraThemeId);
  const [open, setOpen] = useState(false);
  const activeTheme = getAuroraTheme(activeId);

  useEffect(() => {
    const handleThemeChange = (event) => {
      setActiveId(event.detail);
    };

    window.addEventListener(AURORA_THEME_EVENT, handleThemeChange);
    return () => window.removeEventListener(AURORA_THEME_EVENT, handleThemeChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className={`relative grid size-[34px] place-items-center rounded-full border border-white/[0.14] bg-white/[0.05] text-[rgba(244,244,248,0.88)] transition-[border-color,background,transform] duration-200 hover:border-white/[0.28] hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-bright,#c084fc)] ${open ? "border-white/[0.28] bg-white/[0.08]" : ""}`}
        aria-label="Change aurora theme"
        aria-expanded={open}
        aria-haspopup="true"
        title="Change aurora theme"
        onClick={() => setOpen((value) => !value)}
      >
        <span
          className="absolute inset-[5px] rounded-full opacity-90"
          style={{
            background: `linear-gradient(135deg, ${activeTheme.colorStops[0]}, ${activeTheme.colorStops[1]}, ${activeTheme.colorStops[2]})`,
          }}
          aria-hidden="true"
        />
        <svg
          className="relative z-[1] size-[15px] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"
            fill="currentColor"
          />
          <circle cx="7.5" cy="11.5" r="1.25" fill="currentColor" />
          <circle cx="10.5" cy="7.5" r="1.25" fill="currentColor" />
          <circle cx="14.5" cy="8.5" r="1.25" fill="currentColor" />
        </svg>
      </button>

      <div
        className={`absolute right-0 top-[calc(100%+10px)] flex items-center gap-2 rounded-full border border-white/[0.12] bg-[rgba(10,10,18,0.92)] p-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-[opacity,transform] duration-[180ms] max-[560px]:left-0 max-[560px]:right-auto ${open ? "pointer-events-auto translate-y-0 scale-100 opacity-100" : "pointer-events-none -translate-y-1.5 scale-[0.96] opacity-0 invisible"}`}
        role="group"
        aria-label="Aurora color theme"
        aria-hidden={!open}
      >
        {AURORA_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`size-[22px] cursor-pointer rounded-full border-2 transition-[transform,border-color,box-shadow] duration-200 hover:scale-[1.08] hover:border-white/[0.42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-bright,#c084fc)] ${activeId === theme.id ? "border-white shadow-[0_0_0_2px_rgba(255,255,255,0.14)]" : "border-white/[0.18]"}`}
            aria-label={theme.label}
            aria-pressed={activeId === theme.id}
            title={theme.label}
            style={{
              background: `linear-gradient(135deg, ${theme.colorStops[0]}, ${theme.colorStops[1]}, ${theme.colorStops[2]})`,
            }}
            onClick={() => {
              setActiveId(theme.id);
              writeStoredAuroraThemeId(theme.id);
              setOpen(false);
            }}
          />
        ))}
      </div>
    </div>
  );
}
