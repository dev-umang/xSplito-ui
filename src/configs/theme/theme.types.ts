export type ThemeMode = "light" | "dark";
export type ThemePreferences = ThemeMode | "system";

export interface ThemeStoreType {
  mode: ThemeMode;
  preferences: ThemePreferences;
  actions: {
    updatePreferences: (preferences: ThemePreferences) => void;
  };
}
