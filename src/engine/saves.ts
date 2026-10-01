import type { Snapshot } from "@/lib/types";

export const SLOTS_KEY = "story-slots-v1";
export const SLOT_COUNT = 6;

export interface SlotMeta {
  index: number;
  savedAt: number | null;
  day: number | null;
  sceneId: string | null;
  label?: string;
}

function readAll(): (Snapshot | null)[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY);
    if (!raw) return Array(SLOT_COUNT).fill(null);
    const parsed = JSON.parse(raw) as (Snapshot | null)[];
    const out: (Snapshot | null)[] = Array(SLOT_COUNT).fill(null);
    parsed.forEach((s, i) => {
      if (i < SLOT_COUNT) out[i] = s ?? null;
    });
    return out;
  } catch {
    return Array(SLOT_COUNT).fill(null);
  }
}

function writeAll(slots: (Snapshot | null)[]) {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch {
    /* storage full or unavailable */
  }
}

export function slotMeta(): SlotMeta[] {
  return readAll().map((s, i) => ({
    index: i,
    savedAt: s?.savedAt ?? null,
    day: s?.day ?? null,
    sceneId: s?.sceneId ?? null,
  }));
}

export function readSlot(i: number): Snapshot | null {
  return readAll()[i] ?? null;
}

export function writeSlot(i: number, snap: Snapshot): boolean {
  if (i < 0 || i >= SLOT_COUNT) return false;
  const slots = readAll();
  slots[i] = { ...snap, savedAt: Date.now() } as Snapshot;
  writeAll(slots);
  return true;
}

export function deleteSlot(i: number): void {
  const slots = readAll();
  slots[i] = null;
  writeAll(slots);
}

export function exportSnapshot(i: number, filename: string): boolean {
  const snap = readSlot(i);
  if (!snap) return false;
  const blob = new Blob([JSON.stringify(snap, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function importSnapshot(
  file: File,
  slot: number,
): Promise<boolean> {
  try {
    const text = await file.text();
    const snap = JSON.parse(text) as Snapshot;
    if (!snap || typeof snap.sceneId !== "string" || !snap.meters) return false;
    const slots = readAll();
    slots[slot] = { ...snap, savedAt: Date.now() } as Snapshot;
    writeAll(slots);
    return true;
  } catch {
    return false;
  }
}
