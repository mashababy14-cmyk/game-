import type {
  CharacterDef,
  ItemDef,
  MapLink,
  MapLocation,
  MeterDef,
  SceneNode,
  ShopEntry,
  TimeOfDay,
} from "@/lib/types";
import metaJson from "../../content/meta.json";
import charactersJson from "../../content/characters.json";
import metersJson from "../../content/meters.json";
import mapJson from "../../content/map.json";
import itemsJson from "../../content/items.json";
import shopJson from "../../content/shop.json";
import { sceneFiles } from "../../content/scenes/index";

export interface Meta {
  title: string;
  subtitle?: string;
  version?: string;
  startingMoney: number;
  firstSceneId: string;
  startTime?: { day: number; tod: TimeOfDay };
}

export const meta = metaJson as unknown as Meta;
export const characters = (charactersJson as unknown as { characters: CharacterDef[] })
  .characters;
export const meterDefs = (metersJson as unknown as { meters: MeterDef[] }).meters;
export const mapLocations = (mapJson as unknown as { locations: MapLocation[] })
  .locations;
export const mapLinks = ((mapJson as unknown as { links?: MapLink[] }).links ??
  []) as MapLink[];
export const items = (itemsJson as unknown as { items: ItemDef[] }).items;
export const shopStock = (shopJson as unknown as { stock: ShopEntry[] }).stock;

export const scenes: SceneNode[] = sceneFiles.flat();
export const scenesById: Record<string, SceneNode> = Object.fromEntries(
  scenes.map((s) => [s.id, s]),
);
export const firstSceneId = meta.firstSceneId;
export const startingMoney = meta.startingMoney;
export const startTime = meta.startTime ?? { day: 1, tod: "night" as TimeOfDay };

export function characterById(id: string): CharacterDef | undefined {
  return characters.find((c) => c.id === id);
}

export function displayName(
  id: string,
  edits: Record<string, Record<string, string>>,
): string {
  if (id === "narrator" || id === "mc") {
    return id === "mc"
      ? edits.mc?.name?.trim() || characterById("mc")?.defaultName || "You"
      : "";
  }
  const over = edits[id]?.name?.trim();
  if (over) return over;
  return characterById(id)?.defaultName ?? id;
}

export function displayRelationship(
  id: string,
  edits: Record<string, Record<string, string>>,
): string {
  const over = edits[id]?.relationship?.trim();
  if (over) return over;
  return characterById(id)?.defaultRelationship ?? "";
}

export function meterLabel(id: string): string {
  return meterDefs.find((m) => m.id === id)?.label ?? id;
}

export function locationById(id: string): MapLocation | undefined {
  return mapLocations.find((l) => l.id === id);
}

/** Which map location the current scene belongs to. */
export function locationForScene(sceneId: string): MapLocation | undefined {
  const loc = scenesById[sceneId]?.location;
  return loc ? locationById(loc) : undefined;
}

export type CharacterMode = "chat" | "sex";

/** Scene is a sex/intimate scene -> must use video. Otherwise chat -> photo. */
export function sceneMode(scene?: SceneNode): CharacterMode {
  if (!scene) return "chat";
  if (scene.intimate) return "sex";
  if (scene.mode) return scene.mode;
  if (scene.video && !scene.photo) return "sex";
  return "chat";
}

export function isAiCharacter(id: string): boolean {
  return characterById(id)?.ai === true;
}

/** Stable string hash (FNV-1a 32-bit) for deterministic random picks. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Pick a stable-random index in [0, len) from a seed string. */
export function randomIndex(seed: string, len: number): number {
  if (len <= 0) return 0;
  return hashSeed(seed) % len;
}

/** Sex-scene audio pool. Rule: sound plays ONLY when sex happens (mode sex). */
export const sexSounds = [
  "/media/audio/sex-sound-1.mp3",
  "/media/audio/sex-sound-2.mp3",
];

/** Stable pick of a sex sound per scene — same scene always gets the same clip. */
export function sexSoundFor(sceneId: string): string {
  return sexSounds[randomIndex(`sex:${sceneId}`, sexSounds.length)];
}

/**
 * Chat portrait for a character.
 * Rule: photo = chat, NEVER video.
 * Default "random": stable hash of seed so ep1 doesn't always start at girl1
 * and long chats don't repeat the same order. Pass imageMode "sequential"
 * for strict gallery order (index % len).
 */
export function characterPhoto(
  id: string,
  index = 0,
  opts?: { seed?: string; mode?: "random" | "sequential" },
): string | undefined {
  const c = characterById(id);
  if (!c) return undefined;
  if (c.photos?.length) {
    if (opts?.mode === "sequential") return c.photos[index % c.photos.length];
    return c.photos[randomIndex(opts?.seed ?? `${id}:${index}`, c.photos.length)];
  }
  return c.photo;
}

/**
 * Intimate clip for a character.
 * Rule: video = sex, NEVER photo.
 */
export function characterVideo(
  id: string,
  index = 0,
  opts?: { seed?: string; mode?: "random" | "sequential" },
): string | undefined {
  const c = characterById(id);
  if (!c) return undefined;
  if (c.videos?.length) {
    if (opts?.mode === "sequential") return c.videos[index % c.videos.length];
    if (opts?.seed !== undefined)
      return c.videos[randomIndex(opts.seed, c.videos.length)];
    return c.videos[index % c.videos.length];
  }
  return c.video;
}

/** Resolve what the Media panel should show for a scene + line.
 *  Enforced: chat -> photo only, sex -> video only.
 */
export function mediaForScene(
  scene?: SceneNode,
  opts?: { lineIndex?: number; speaker?: string },
): { kind: "video" | "photo" | "none"; src?: string; characterId?: string } {
  if (!scene) return { kind: "none" };
  const mode = sceneMode(scene);
  const lineIndex = opts?.lineIndex ?? 0;
  const seed = `${scene.id}:${lineIndex}`;
  const imgMode = scene.imageMode ?? "random";

  if (mode === "sex") {
    // Explicit scene video wins; curated list is sequential (author order).
    if (scene.video) {
      return {
        kind: "video",
        src: scene.video,
        characterId: scene.character ?? opts?.speaker,
      };
    }
    if (scene.videos?.length) {
      return {
        kind: "video",
        src: scene.videos[lineIndex % scene.videos.length],
        characterId: scene.character ?? opts?.speaker,
      };
    }
    const fallbackId =
      scene.character ??
      (opts?.speaker && opts.speaker !== "narrator" && opts.speaker !== "mc"
        ? opts.speaker
        : "ayesha");
    const v = characterVideo(fallbackId, lineIndex, { seed, mode: imgMode });
    if (v) return { kind: "video", src: v, characterId: fallbackId };
    // VIDEO-ONLY-SEX: never fall back to a photo here.
    return { kind: "none", characterId: fallbackId };
  }

  // chat -> photo only, never video.
  if (scene.photo) {
    return {
      kind: "photo",
      src: scene.photo,
      characterId: scene.character ?? opts?.speaker,
    };
  }
  if (scene.photos?.length) {
    return {
      kind: "photo",
      src: scene.photos[lineIndex % scene.photos.length],
      characterId: scene.character ?? opts?.speaker,
    };
  }

  const fallbackId =
    scene.character ??
    (opts?.speaker && opts.speaker !== "narrator" && opts.speaker !== "mc"
      ? opts.speaker
      : "ayesha");

  const p = characterPhoto(fallbackId, lineIndex, { seed, mode: imgMode });
  if (p) return { kind: "photo", src: p, characterId: fallbackId };
  return { kind: "none", characterId: fallbackId };
}
