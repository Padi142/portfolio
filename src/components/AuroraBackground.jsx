import { useEffect, useState } from "react";

import Aurora from "@/components/Aurora.jsx";
import {
  AURORA_THEME_EVENT,
  getAuroraTheme,
  readStoredAuroraThemeId,
} from "@/lib/aurora-themes";

export default function AuroraBackground({ overrideColorStops }) {
  const [themeId, setThemeId] = useState(readStoredAuroraThemeId);
  const theme = getAuroraTheme(themeId);
  const colorStops = overrideColorStops?.length === 3 ? overrideColorStops : theme.colorStops;

  useEffect(() => {
    if (overrideColorStops) return;

    const handleThemeChange = (event) => {
      setThemeId(event.detail);
    };

    window.addEventListener(AURORA_THEME_EVENT, handleThemeChange);
    return () => window.removeEventListener(AURORA_THEME_EVENT, handleThemeChange);
  }, [overrideColorStops]);

  return (
    <Aurora
      colorStops={colorStops}
      blend={0.55}
      amplitude={1.15}
      speed={0.35}
    />
  );
}
