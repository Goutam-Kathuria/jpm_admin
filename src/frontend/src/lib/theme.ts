export interface ThemeSettings {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  fontStyle: "serif" | "sans";
  density: "compact" | "comfortable";
  borderRadius: "small" | "medium" | "large";
}

export const defaultTheme: ThemeSettings = {
  primaryColor: "0.55 0.12 30",
  accentColor: "0.5 0.1 160",
  darkMode: false,
  fontStyle: "serif",
  density: "comfortable",
  borderRadius: "medium",
};

const STORAGE_KEY = "luxeadmin_theme";

const radiusMap = {
  small: "0.25rem",
  medium: "0.5rem",
  large: "0.75rem",
};

export function applyTheme(settings: ThemeSettings): void {
  const root = document.documentElement;

  // Apply dark mode
  if (settings.darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  // Apply primary color
  root.style.setProperty("--primary", settings.primaryColor);
  root.style.setProperty("--ring", settings.primaryColor);
  root.style.setProperty("--sidebar-primary", settings.primaryColor);
  root.style.setProperty("--sidebar-ring", settings.primaryColor);

  // Apply accent color
  root.style.setProperty("--accent", settings.accentColor);

  // Apply font style
  if (settings.fontStyle === "sans") {
    root.style.setProperty("--font-display", "'DM Sans'");
  } else {
    root.style.setProperty("--font-display", "'Lora'");
  }

  // Apply border radius
  root.style.setProperty("--radius", radiusMap[settings.borderRadius]);

  // Apply density (used as CSS custom property for spacing)
  root.style.setProperty(
    "--density-spacing",
    settings.density === "compact" ? "0.5rem" : "1rem",
  );
  root.style.setProperty(
    "--density-padding",
    settings.density === "compact" ? "0.75rem" : "1.25rem",
  );
}

export function saveSettings(settings: ThemeSettings): void {
  // TODO: connect API here
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function loadSettings(): ThemeSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultTheme, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return { ...defaultTheme };
}
