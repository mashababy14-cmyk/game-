import type { Prefs, TimeOfDay } from "@/lib/types";

export interface AccentPreset {
  key: string;
  label: string;
  accent: string;
  accent2: string;
}

export const ACCENTS: AccentPreset[] = [
  { key: "violet", label: "Violet", accent: "#8b7cf6", accent2: "#5ec8f2" },
  { key: "indigo", label: "Indigo", accent: "#6f7cf6", accent2: "#7ea6ff" },
  { key: "teal", label: "Teal", accent: "#4fc0b0", accent2: "#6fe0d2" },
  { key: "rose", label: "Rose", accent: "#e0709b", accent2: "#f0a2c0" },
  { key: "amber", label: "Amber", accent: "#d9a94a", accent2: "#e8c268" },
  { key: "mono", label: "Mono", accent: "#9aa0b5", accent2: "#c8ccd8" },
];

export function accentByKey(key: string): AccentPreset {
  return ACCENTS.find((a) => a.key === key) ?? ACCENTS[0];
}

export const FONT_SIZES = [13, 14, 15, 16, 18, 20];
export const AUTO_ADVANCE = [0, 1200, 2000, 3000, 5000];
export const HISTORY_LIMITS = [50, 100, 300, 1000];

export const DEFAULT_PREFS: Prefs = {
  textSpeed: 24,
  fontSize: 15,
  autoAdvance: 0,
  accent: "violet",
  motion: true,
  tapAnywhere: true,
  meterIcons: true,
  historyLimit: 300,
};

export const TOD_META: Record<
  TimeOfDay,
  { label: string; icon: string; tint: string }
> = {
  morning: { label: "Morning", icon: "sun", tint: "#e8c268" },
  afternoon: { label: "Afternoon", icon: "sun", tint: "#d9a94a" },
  evening: { label: "Evening", icon: "cloud", tint: "#c08a6a" },
  night: { label: "Night", icon: "moon", tint: "#7c8ac0" },
};

export const TOD_TINT: Record<TimeOfDay, string> = {
  morning: "#e8c268",
  afternoon: "#d9a94a",
  evening: "#c08a6a",
  night: "#7c8ac0",
};
