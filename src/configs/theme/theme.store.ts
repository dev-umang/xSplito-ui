import { create } from "zustand";
import type {
  ThemeMode,
  ThemePreferences,
  ThemeStoreType,
} from "./theme.types";

/**
 * Detects the system's theme preference
 */
const getSystemTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Calculates the actual theme mode based on preference
 */
const calculateMode = (preference: ThemePreferences): ThemeMode => {
  if (preference === "system") {
    return getSystemTheme();
  }
  return preference;
};

/**
 * Applies theme to the document
 */
const applyTheme = (mode: ThemeMode) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(mode);
  document.documentElement.setAttribute("data-theme", mode);
};

/**
 * Gets stored preference or defaults to system
 */
const getStoredPreference = (): ThemePreferences => {
  const stored = localStorage.getItem(
    "theme-preferences",
  ) as ThemePreferences | null;
  return stored || "system";
};

const initialPreference = getStoredPreference();
const initialMode = calculateMode(initialPreference);

// Apply initial theme immediately
if (typeof window !== "undefined") {
  applyTheme(initialMode);
}

const useThemeStore = create<ThemeStoreType>((set, get) => ({
  mode: initialMode,
  preferences: initialPreference,
  actions: {
    updatePreferences: (pref: ThemePreferences) => {
      const mode = calculateMode(pref);

      // Save to localStorage
      localStorage.setItem("theme-preferences", pref);

      // Apply theme
      applyTheme(mode);

      // Update state
      set({ preferences: pref, mode });

      // If system preference, set up listener for system theme changes
      if (pref === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
          const currentPref = get().preferences;
          if (currentPref === "system") {
            const newMode = getSystemTheme();
            applyTheme(newMode);
            set({ mode: newMode });
          }
        };

        // Clean up previous listener if exists
        mediaQuery.removeEventListener("change", handleChange);
        mediaQuery.addEventListener("change", handleChange);
      }
    },
  },
}));

// ==== SELECTOR ====
export const useDarkMode = () => useThemeStore((s) => s.mode) === "dark";
export const useThemeMode = () => useThemeStore((s) => s.mode);

// ==== ACTIONS ====
export const useThemeActions = () => useThemeStore((s) => s.actions);
