"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  firstSceneId,
  mapLocations,
  meterDefs,
  shopStock,
  items,
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
  setHistoryLimit,
  type EngineState,
} from "@/engine/runner";
import type { Choice, Prefs, Snapshot, TimeOfDay } from "@/lib/types";

export interface GameStore extends EngineState {
  started: boolean;
  prefs: Prefs;
  /** charId -> field -> user value */
  edits: Record<string, Record<string, string>>;
  lastChoiceText: string | null;

  newGame: () => void;
  advance: () => void;
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

      advance: () => set((s) => ({ ...s, ...engineAdvance(s) })),

      choose: (c) =>
        set((s) => ({
          ...s,
          ...engineChoose(s, c),
          started: true,
          lastChoiceText: c.text,
        })),

      fallback: () => set((s) => ({ ...s, ...fallbackContinue(s) })),

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
        };
      },

      saveToSlot: (i) => {
        if (i < 0 || i >= SLOT_COUNT) return false;
        return writeSlot(i, get().snapshot());
      },

      loadFromSlot: (i) => {
        const snap = readSlot(i);
        if (!snap) return false;
        const prefs = { ...DEFAULT_PREFS, ...(snap.prefs ?? {}) };
        setHistoryLimit(prefs.historyLimit);
        if (typeof window !== "undefined") {
          applyThemeVars(prefs.accent);
          document.documentElement.style.setProperty("--fs", `${prefs.fontSize}px`);
          document.documentElement.style.setProperty("--anim", prefs.motion ? "1" : "0");
        }
        set({ ...snap, prefs, started: true });
        return true;
      },

      resetAll: () => set({ ...freshState() }),
    }),
    {
      name: SAVE_KEY,
      storage: createJSONStorage(() => localStorage),
      version: 2,
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
