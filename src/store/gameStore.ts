"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  firstSceneId,
  mapLocations,
  meterDefs,
  shopStock,
  items,
  scenesById,
  startTime,
  startingMoney,
} from "@/lib/content";
import { DEFAULT_PREFS, accentByKey } from "@/lib/presets";
import { SAVE_KEY } from "@/engine/save";
import { readSlot, writeSlot, SLOT_COUNT } from "@/engine/saves";
import { checkCondition, applyEffects } from "@/engine/effects";
import {
  advance as engineAdvance,
  choose as engineChoose,
  fallbackContinue,
  isAwaitingChoice,
  setHistoryLimit,
  type EngineState,
} from "@/engine/runner";
import type { Choice, Prefs, Snapshot, TimeOfDay } from "@/lib/types";

const PAST_LIMIT = 100;
export const SKIP_LIMIT = 200;

/** Navigable slice of state kept for the Back button (undo stack). */
function pickEngine(s: EngineState): EngineState {
  return {
    sceneId: s.sceneId,
    lineIndex: s.lineIndex,
    meters: s.meters,
    flags: s.flags,
    money: s.money,
    inventory: s.inventory,
    history: s.history,
    ended: s.ended,
    day: s.day,
    tod: s.tod,
  };
}

function pushPast(
  past: EngineState[],
  s: EngineState,
): EngineState[] {
  return [...past, pickEngine(s)].slice(-PAST_LIMIT);
}

export interface GameStore extends EngineState {
  started: boolean;
  prefs: Prefs;
  /** charId -> field -> user value */
  edits: Record<string, Record<string, string>>;
  lastChoiceText: string | null;
  /** undo stack for the Back button / mouse-back (memory only, never persisted) */
  past: EngineState[];

  newGame: () => void;
  advance: () => void;
  back: () => boolean;
  skip: () => void;
  choose: (c: Choice) => void;
  fallback: () => void;
  travel: (locId: string) => boolean;
  buy: (itemId: string) => boolean;
  useItem: (itemId: string) => boolean;
  setEdit: (charId: string, field: string, value: string) => void;
  setPref: <K extends keyof Prefs>(k: K, v: Prefs[K]) => void;
  snapshot: () => Snapshot;
  saveToSlot: (i: number) => boolean;
  loadFromSlot: (i: number) => boolean;
  resetAll: () => void;
}

function freshState() {
  const meters: Record<string, number> = {};
  for (const m of meterDefs) meters[m.id] = m.initial;
  return {
    sceneId: firstSceneId,
    lineIndex: 0,
    meters,
    flags: {},
    money: startingMoney,
    inventory: {},
    history: [],
    ended: false,
    day: startTime.day,
    tod: startTime.tod as TimeOfDay,
    started: false,
    prefs: { ...DEFAULT_PREFS },
    edits: {},
    lastChoiceText: null,
    past: [],
  };
}

/** pushes CSS theme vars so the accent preset applies instantly */
export function applyThemeVars(accentKey: string) {
  const a = accentByKey(accentKey);
  const root = document.documentElement;
  root.style.setProperty("--accent", a.accent);
  root.style.setProperty("--accent-2", a.accent2);
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...freshState(),

      newGame: () => set({ ...freshState(), started: true }),

      advance: () =>
        set((s) => {
          const next = engineAdvance(s);
          if (next === s) return s;
          return { ...next, past: pushPast(s.past, s) };
        }),

      back: () => {
        const s = get();
        if (s.past.length === 0) return false;
        const prev = s.past[s.past.length - 1];
        set({
          ...prev,
          past: s.past.slice(0, -1),
          lastChoiceText: null,
        });
        return true;
      },

      skip: () =>
        set((s) => {
          let cur: EngineState = s;
          let past = s.past;
          for (let i = 0; i < SKIP_LIMIT; i++) {
            if (cur.ended || isAwaitingChoice(cur)) break;
            const next = engineAdvance(cur);
            if (next === cur) break;
            past = pushPast(past, cur);
            cur = next;
          }
          if (cur === (s as EngineState)) return s;
          return { ...cur, past };
        }),

      choose: (c) =>
        set((s) => {
          const next = engineChoose(s, c);
          if (next === s) return s;
          return {
            ...next,
            past: pushPast(s.past, s),
            started: true,
            lastChoiceText: c.text,
          };
        }),

      fallback: () =>
        set((s) => {
          const next = fallbackContinue(s);
          if (next === s) return s;
          return { ...next, past: pushPast(s.past, s) };
        }),

      travel: (locId) => {
        const s = get();
        const loc = mapLocations.find((l) => l.id === locId);
        if (!loc || !loc.sceneId) return false;
        if (
          !checkCondition(loc.unlock, {
            meters: s.meters,
            flags: s.flags,
            inventory: s.inventory,
            day: s.day,
            tod: s.tod,
          })
        )
          return false;
        set({
          ...s,
          sceneId: loc.sceneId,
          lineIndex: 0,
          ended: false,
          started: true,
          day: s.day + (loc.time?.advanceDays ?? 0),
          tod: loc.time?.tod ?? s.tod,
          past: pushPast(s.past, s),
        });
        return true;
      },

      buy: (itemId) => {
        const s = get();
        const stock = shopStock.find((e) => e.itemId === itemId);
        const item = items.find((i) => i.id === itemId);
        if (!stock || !item) return false;
        const already = s.inventory[itemId] ?? 0;
        if (!stock.repeat && already > 0) return false;
        if (s.money < stock.price) return false;
        const eff = applyEffects(
          { ...(item.effect ?? {}), addItems: { ...(item.effect?.addItems ?? {}), [itemId]: 1 } },
          {
            meters: s.meters,
            flags: s.flags,
            money: s.money - stock.price,
            inventory: s.inventory,
            day: s.day,
            tod: s.tod,
          },
        );
        set({ ...s, ...eff });
        return true;
      },

      useItem: (itemId) => {
        const s = get();
        const item = items.find((i) => i.id === itemId);
        if (!item) return false;
        if (item.usable === false) return false;
        if ((s.inventory[itemId] ?? 0) <= 0) return false;
        const eff = applyEffects(item.effect, {
          meters: s.meters,
          flags: s.flags,
          money: s.money,
          inventory: s.inventory,
          day: s.day,
          tod: s.tod,
        });
        const inventory = { ...eff.inventory };
        inventory[itemId] = (inventory[itemId] ?? 0) - 1;
        if (inventory[itemId] <= 0) delete inventory[itemId];
        set({ ...s, ...eff, inventory });
        return true;
      },

      setEdit: (charId, field, value) =>
        set((s) => ({
          edits: {
            ...s.edits,
            [charId]: { ...(s.edits[charId] ?? {}), [field]: value },
          },
        })),

      setPref: (k, v) =>
        set((s) => {
          const prefs = { ...s.prefs, [k]: v };
          if (k === "historyLimit") setHistoryLimit(v as number);
          if (k === "accent") applyThemeVars(v as string);
          if (k === "motion")
            document.documentElement.style.setProperty(
              "--anim",
              v ? "1" : "0",
            );
          if (k === "fontSize")
            document.documentElement.style.setProperty("--fs", `${v}px`);
          return { prefs };
        }),

      snapshot: () => {
        const s = get();
        return {
          sceneId: s.sceneId,
          lineIndex: s.lineIndex,
          meters: s.meters,
          flags: s.flags,
          money: s.money,
          inventory: s.inventory,
          history: s.history,
          ended: s.ended,
          started: s.started,
          day: s.day,
          tod: s.tod,
          prefs: s.prefs,
          edits: s.edits,
          lastChoiceText: s.lastChoiceText,
        };
      },

      saveToSlot: (i) => {
        if (i < 0 || i >= SLOT_COUNT) return false;
        return writeSlot(i, get().snapshot());
      },

      loadFromSlot: (i) => {
        const snap = readSlot(i);
        if (!snap || typeof snap.sceneId !== "string") return false;
        // Old or hand-edited saves may point at removed scenes or lack new
        // meters (lust/corruption were added later). Sanitize everything.
        const sceneId = scenesById[snap.sceneId] ? snap.sceneId : firstSceneId;
        const scene = scenesById[sceneId];
        const lineCount = scene?.lines.length ?? 1;
        const lineIndex =
          Number.isFinite(snap.lineIndex) && (snap.lineIndex as number) >= 0
            ? Math.min(Math.floor(snap.lineIndex as number), Math.max(0, lineCount - 1))
            : 0;
        const meters: Record<string, number> = {};
        for (const m of meterDefs) {
          const v = (snap.meters as Record<string, unknown> | undefined)?.[m.id];
          meters[m.id] =
            typeof v === "number" && Number.isFinite(v)
              ? Math.max(m.min, Math.min(m.max, v))
              : m.initial;
        }
        const num = (v: unknown, fb: number) =>
          typeof v === "number" && Number.isFinite(v) ? v : fb;
        const rec = (v: unknown) =>
          v && typeof v === "object" && !Array.isArray(v)
            ? (v as Record<string, number>)
            : {};
        const prefs = { ...DEFAULT_PREFS, ...((snap.prefs as object) ?? {}) };
        setHistoryLimit(prefs.historyLimit);
        if (typeof window !== "undefined") {
          applyThemeVars(prefs.accent);
          document.documentElement.style.setProperty("--fs", `${prefs.fontSize}px`);
          document.documentElement.style.setProperty("--anim", prefs.motion ? "1" : "0");
        }
        set({
          sceneId,
          lineIndex,
          meters,
          flags: rec(snap.flags) as unknown as Record<string, boolean>,
          money: num(snap.money, startingMoney),
          inventory: rec(snap.inventory),
          history: Array.isArray(snap.history) ? snap.history : [],
          ended: snap.ended === true,
          started: true,
          day: Math.max(1, Math.floor(num(snap.day, startTime.day))),
          tod: snap.tod ?? startTime.tod,
          prefs,
          edits: (snap.edits && typeof snap.edits === "object" ? snap.edits : {}) as Record<
            string,
            Record<string, string>
          >,
          lastChoiceText: typeof snap.lastChoiceText === "string" ? snap.lastChoiceText : null,
          past: [],
        });
        return true;
      },

      resetAll: () => set({ ...freshState() }),
    }),
    {
      name: SAVE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // The Back-button undo stack is memory-only: persisting 100 full states
      // (each with its own history log) would bloat localStorage.
      partialize: (s) => {
        const out = { ...(s as GameStore) };
        delete (out as { past?: unknown }).past;
        return out;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const prefs = { ...DEFAULT_PREFS, ...(state.prefs ?? {}) };
        setHistoryLimit(prefs.historyLimit);
        applyThemeVars(prefs.accent);
        document.documentElement.style.setProperty("--fs", `${prefs.fontSize}px`);
        document.documentElement.style.setProperty("--anim", prefs.motion ? "1" : "0");
      },
    },
  ),
);
