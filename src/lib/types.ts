export interface Meta {
  title: string;
  subtitle?: string;
  version?: string;
  startingMoney: number;
  firstSceneId: string;
  startTime?: { day: number; tod: TimeOfDay };
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export const TIME_ORDER: TimeOfDay[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

export interface Prefs {
  /** ms per character, 0 = instant */
  textSpeed: number;
  /** base dialogue font size in px */
  fontSize: number;
  /** auto-advance delay in ms, 0 = off */
  autoAdvance: number;
  /** accent preset key, see lib/presets */
  accent: string;
  /** UI animations on/off */
  motion: boolean;
  /** tap anywhere advances instead of only the dialogue box */
  tapAnywhere: boolean;
  /** show meter icons in the compact HUD */
  meterIcons: boolean;
  /** max lines kept in history */
  historyLimit: number;
}

export interface CharacterDef {
  id: string;
  defaultName: string;
  gender?: string;
  role?: string;
  defaultRelationship?: string;
  /** fields the user may edit in Settings */
  editable?: string[];
  /** Chat portrait (photo). Rule: photo = chat. */
  photo?: string;
  /** Intimate clip (video). Rule: video = sex. */
  video?: string;
  /** Full AI photo gallery for chat rotation */
  photos?: string[];
  /** Full AI video gallery for sex scenes */
  videos?: string[];
  /** true = fully AI-generated, no real person */
  ai?: boolean;
  description?: string;
}

export interface MeterDef {
  id: string;
  label: string;
  min: number;
  max: number;
  initial: number;
  /** icon name used in the compact HUD, see ui/Icon */
  icon?: string;
  /** higher = better for endings */
  positive?: boolean;
}

export interface Line {
  /** character id, or "narrator" */
  speaker: string;
  text: string;
}

export interface Condition {
  meter?: string;
  gte?: number;
  lte?: number;
  flag?: string;
  flagValue?: boolean;
  /** inventory count check, e.g. { item: "condom", count: 1 } */
  item?: string;
  itemCount?: number;
  day?: number;
  tod?: TimeOfDay;
}

export interface ChoiceEffect {
  meters?: Record<string, number>;
  flags?: Record<string, boolean>;
  money?: number;
  time?: { advanceDays?: number; tod?: TimeOfDay };
  addItems?: Record<string, number>;
  /** consumed on choose, e.g. { condom: 1 }. Clamped at 0, removed when empty. */
  consumeItems?: Record<string, number>;
}

export interface Choice {
  text: string;
  condition?: Condition;
  /** `effects` is accepted as an alias so hand-written scripts just work */
  effect?: ChoiceEffect;
  effects?: ChoiceEffect;
  goto: string;
}

export interface SceneNode {
  id: string;
  /** map location id this scene takes place in, for the map screen */
  location?: string;
  /** which character is on screen (photo/video fallback) */
  character?: string;
  /** chat = photo, sex = video. Defaults to chat. */
  mode?: "chat" | "sex";
  /** alias for mode === "sex". When true, play character/scene video. */
  intimate?: boolean;
  photo?: string;
  video?: string;
  /** Author-curated per-line sequence. Chat uses lineIndex % len (sequential). */
  photos?: string[];
  /** Author-curated clips. Sex uses lineIndex % len (sequential). */
  videos?: string[];
  /** Chat gallery pick: "random" (default, stable hash, no repeat-from-start) or "sequential". */
  imageMode?: "random" | "sequential";
  time?: { advanceDays?: number; tod?: TimeOfDay };
  lines: Line[];
  choices?: Choice[];
  goto?: string;
}

export interface MapLocation {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  /** floor / area label shown on the map */
  zone?: string;
  /** percentage coordinates on the map board, 0-100 */
  x?: number;
  y?: number;
  sceneId?: string;
  /** or an app page to open, e.g. "/shop" */
  page?: string;
  time?: { advanceDays?: number; tod?: TimeOfDay };
  unlock?: Condition;
}

export interface MapLink {
  from: string;
  to: string;
}

export interface ItemDef {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  effect?: ChoiceEffect;
  /** false = cannot be used from Bag/Shop manually (auto-consumed by story choices instead). Default true. */
  usable?: boolean;
}

export interface ShopEntry {
  itemId: string;
  price: number;
  repeat?: boolean;
}

export interface HistoryLine {
  speaker: string;
  text: string;
}

/** Everything that gets written to a save slot. */
export interface Snapshot {
  sceneId: string;
  lineIndex: number;
  meters: Record<string, number>;
  flags: Record<string, boolean>;
  money: number;
  inventory: Record<string, number>;
  history: HistoryLine[];
  ended: boolean;
  started: boolean;
  day: number;
  tod: TimeOfDay;
  prefs: Prefs;
  edits: Record<string, Record<string, string>>;
  savedAt?: number;
}
