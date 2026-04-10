import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { type ThemeSettings, saveSettings } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import { Moon, Save, Settings, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// Converts a hex color (#rrggbb) to a rough oklch L C H string for CSS variable
function hexToOklchApprox(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
  // Simple RGB brightness approximation for L
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) ** 0.43;
  // Rough chroma estimate
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const C = ((max - min) * 0.5).toFixed(3);
  // Hue angle
  let H = 0;
  if (max !== min) {
    if (max === r) H = ((g - b) / (max - min)) * 60;
    else if (max === g) H = 120 + ((b - r) / (max - min)) * 60;
    else H = 240 + ((r - g) / (max - min)) * 60;
    if (H < 0) H += 360;
  }
  return `${Math.min(0.9, Math.max(0.3, L)).toFixed(2)} ${C} ${Math.round(H)}`;
}

// Converts an oklch string "L C H" to a rough hex for color input default
function oklchToHexApprox(oklch: string): string {
  const parts = oklch.split(" ");
  if (parts.length < 3) return "#c9a96e";
  const [, , hStr] = parts;
  const h = Number.parseFloat(hStr);
  // Map hue to a rough hex using HSL with fixed S/L
  const hsl = `hsl(${h}, 50%, 45%)`;
  // Use CSS to parse — fallback approach with canvas
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#c9a96e";
    ctx.fillStyle = hsl;
    ctx.fillRect(0, 0, 1, 1);
    const [red, green, blue] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;
  } catch {
    return "#c9a96e";
  }
}

const colorPresets = [
  { label: "Gold", value: "0.55 0.12 30" },
  { label: "Rose", value: "0.55 0.15 10" },
  { label: "Sage", value: "0.5 0.1 160" },
  { label: "Sky", value: "0.5 0.1 220" },
  { label: "Plum", value: "0.45 0.12 290" },
  { label: "Slate", value: "0.45 0.04 230" },
];

const accentPresets = [
  { label: "Sage", value: "0.5 0.1 160" },
  { label: "Gold", value: "0.55 0.12 30" },
  { label: "Sky", value: "0.5 0.1 220" },
  { label: "Rose", value: "0.55 0.15 10" },
  { label: "Plum", value: "0.45 0.12 290" },
  { label: "Warm", value: "0.5 0.08 50" },
];

function ColorSwatch({
  value,
  selected,
  label,
  onClick,
}: { value: string; selected: boolean; label: string; onClick: () => void }) {
  const [l, c, h] = value.split(" ");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "w-7 h-7 rounded-full border-2 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-foreground scale-110" : "border-transparent",
      )}
      style={{ background: `oklch(${l} ${c} ${h})` }}
    />
  );
}

function ColorPickerRow({
  label,
  value,
  presets,
  onPreset,
  onColorPick,
}: {
  label: string;
  value: string;
  presets: { label: string; value: string }[];
  onPreset: (v: string) => void;
  onColorPick: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </p>
      {/* Preset swatches */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        {presets.map((p) => (
          <ColorSwatch
            key={p.label}
            value={p.value}
            selected={value === p.value}
            label={p.label}
            onClick={() => onPreset(p.value)}
          />
        ))}
      </div>
      {/* Native color picker */}
      <div className="flex items-center gap-2">
        <label
          htmlFor={`color-picker-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="text-xs text-muted-foreground"
        >
          Custom:
        </label>
        <input
          id={`color-picker-${label.toLowerCase().replace(/\s+/g, "-")}`}
          type="color"
          className="w-8 h-8 rounded cursor-pointer border border-border bg-transparent p-0.5"
          defaultValue={oklchToHexApprox(value)}
          onChange={(e) => onColorPick(hexToOklchApprox(e.target.value))}
          aria-label={`Custom ${label}`}
          data-ocid={`color-picker-${label.toLowerCase().replace(/\s+/g, "-")}`}
        />
        <span className="text-xs text-muted-foreground font-mono truncate">
          oklch({value})
        </span>
      </div>
    </div>
  );
}

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const { settings, updateSettings } = useThemeStore();

  function setField<K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K],
  ) {
    updateSettings({ [key]: value });
  }

  function handleSave() {
    saveSettings(settings);
    toast.success("Theme settings saved");
  }

  const isDark = settings.darkMode;

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-110 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open theme customizer"
        data-ocid="theme-customizer-trigger"
      >
        <Settings
          className="w-5 h-5 transition-transform duration-500 hover:rotate-90"
          style={{ animationDuration: "8s" }}
        />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-80 bg-card border-l border-border flex flex-col gap-0 p-0 overflow-y-auto"
          data-ocid="theme-customizer-panel"
        >
          <SheetHeader className="p-5 border-b border-border">
            <SheetTitle className="font-display text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Customize Theme
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 p-5 space-y-7">
            {/* Dark / Light Mode */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Appearance
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-primary" />
                  ) : (
                    <Sun className="w-4 h-4 text-primary" />
                  )}
                  <Label htmlFor="dark-mode" className="cursor-pointer">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDark}
                  onCheckedChange={(v) => setField("darkMode", v)}
                  data-ocid="dark-mode-toggle"
                />
              </div>
            </div>

            {/* Primary Color */}
            <ColorPickerRow
              label="Primary Color"
              value={settings.primaryColor}
              presets={colorPresets}
              onPreset={(v) => setField("primaryColor", v)}
              onColorPick={(v) => setField("primaryColor", v)}
            />

            {/* Accent Color */}
            <ColorPickerRow
              label="Accent Color"
              value={settings.accentColor}
              presets={accentPresets}
              onPreset={(v) => setField("accentColor", v)}
              onColorPick={(v) => setField("accentColor", v)}
            />

            {/* Font Style */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Font Style
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["serif", "sans"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setField("fontStyle", f)}
                    data-ocid={`font-style-${f}`}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-sm transition-all duration-150",
                      f === "serif" ? "font-display" : "font-body",
                      settings.fontStyle === f
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                    )}
                  >
                    {f === "serif" ? "Aa Serif" : "Aa Sans"}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Density */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Layout Density
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(["compact", "comfortable"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setField("density", d)}
                    data-ocid={`density-${d}`}
                    className={cn(
                      "py-2 px-3 rounded-lg border text-sm transition-all duration-150 capitalize",
                      settings.density === d
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Radius */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Border Radius
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(["small", "medium", "large"] as const).map((r) => {
                  const rad =
                    r === "small" ? "2px" : r === "medium" ? "8px" : "14px";
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setField("borderRadius", r)}
                      data-ocid={`border-radius-${r}`}
                      className={cn(
                        "py-2 px-3 border text-sm transition-all duration-150 capitalize",
                        settings.borderRadius === r
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border text-muted-foreground hover:border-input hover:text-foreground",
                      )}
                      style={{ borderRadius: rad }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="p-5 border-t border-border">
            <Button
              onClick={handleSave}
              className="w-full gap-2"
              data-ocid="save-theme"
            >
              <Save className="w-4 h-4" />
              Save Theme
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Changes apply instantly. Save to persist.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
