import { useEffect } from "react";
import axios from "axios";
import { hexToHslComponents } from "@/lib/themeColors";

const PUBLIC_THEME_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "") +
  "/settings/public";

/**
 * Muat tema dari MySQL (GET /api/settings/public) dan terapkan ke :root.
 */
export function ThemeSync() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get(PUBLIC_THEME_URL, { timeout: 8000 });
        if (cancelled || !data?.success || !data?.data) return;
        const t = data.data;
        const root = document.documentElement;
        const p = hexToHslComponents(t.theme_primary_color);
        const s = hexToHslComponents(t.theme_secondary_color);
        if (p) {
          root.style.setProperty("--primary", p);
          root.style.setProperty("--ring", p);
          root.style.setProperty("--sidebar-primary", p);
          root.style.setProperty("--sidebar-ring", p);
          const parts = p.trim().split(/\s+/);
          if (parts.length >= 3) {
            const [h] = parts;
            root.style.setProperty("--accent", `${h} 35% 94%`);
          }
        }
        if (s) root.style.setProperty("--secondary", s);
        if (t.theme_background && /^#?[0-9a-fA-F]{6}$/.test(t.theme_background.replace("#", ""))) {
          const bg = hexToHslComponents(t.theme_background.startsWith("#") ? t.theme_background : `#${t.theme_background}`);
          if (bg) root.style.setProperty("--background", bg);
        }
      } catch {
        /* default theme */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
