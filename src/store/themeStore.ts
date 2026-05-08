import {
  type ThemeSettings,
  applyTheme,
  defaultTheme,
  loadSettings,
  saveSettings,
} from "@/lib/theme";
import { create } from "zustand";

interface ThemeStore {
  settings: ThemeSettings;
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  saveTheme: () => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  settings: defaultTheme,

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    applyTheme(updated);
  },

  saveTheme: () => {
    const { settings } = get();
    saveSettings(settings);
  },

  initTheme: () => {
    const loaded = loadSettings();
    set({ settings: loaded });
    applyTheme(loaded);
  },
}));
