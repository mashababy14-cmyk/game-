import { meterDefs } from "@/lib/content";
import type { ChoiceEffect, Condition, TimeOfDay } from "@/lib/types";

export interface CheckState {
  meters: Record<string, number>;
  flags: Record<string, boolean>;
  inventory: Record<string, number>;
  day: number;
  tod: TimeOfDay;
}

export function checkCondition(
  cond: Condition | undefined,
  s: CheckState,
): boolean {
  if (!cond) return true;
  if (cond.meter) {
    const v = s.meters[cond.meter] ?? 0;
    if (cond.gte !== undefined && v < cond.gte) return false;
    if (cond.lte !== undefined && v > cond.lte) return false;
  }
  if (cond.flag) {
    const val = s.flags[cond.flag] ?? false;
    if (val !== (cond.flagValue ?? true)) return false;
  }
  if (cond.item) {
    const have = s.inventory[cond.item] ?? 0;
    if (have < (cond.itemCount ?? 1)) return false;
  }
  if (cond.day !== undefined && s.day !== cond.day) return false;
  if (cond.tod && s.tod !== cond.tod) return false;
  return true;
}

export function applyEffects(
  eff: ChoiceEffect | undefined,
  s: {
    meters: Record<string, number>;
    flags: Record<string, boolean>;
    money: number;
    inventory: Record<string, number>;
    day: number;
    tod: TimeOfDay;
  },
) {
  const meters = { ...s.meters };
  const flags = { ...s.flags };
  const inventory = { ...s.inventory };
  let money = s.money;
  let day = s.day;
  let tod = s.tod;

  if (eff) {
    // Accepts either { "meters": { affection: 10 } } or a flat map:
    // { affection: 10, trust: 5 } — any key that is a known meter id.
    const deltas: Record<string, number> = { ...(eff.meters ?? {}) };
    for (const [k, v] of Object.entries(eff)) {
      if (k === "meters" || k === "flags" || k === "money" || k === "time" || k === "addItems" || k === "consumeItems")
        continue;
      if (typeof v === "number" && meterDefs.some((m) => m.id === k)) deltas[k] = v;
    }

    for (const [k, v] of Object.entries(deltas)) {
      const def = meterDefs.find((m) => m.id === k);
      let next = (meters[k] ?? def?.initial ?? 0) + v;
      if (def) next = Math.max(def.min, Math.min(def.max, next));
      meters[k] = next;
    }
    Object.assign(flags, eff.flags);
    for (const [k, v] of Object.entries(eff.addItems ?? {})) {
      inventory[k] = (inventory[k] ?? 0) + v;
    }
    for (const [k, v] of Object.entries(eff.consumeItems ?? {})) {
      inventory[k] = Math.max(0, (inventory[k] ?? 0) - v);
      if (inventory[k] <= 0) delete inventory[k];
    }
    money += eff.money ?? 0;
    day += eff.time?.advanceDays ?? 0;
    if (eff.time?.tod) tod = eff.time.tod;
  }

  return { meters, flags, money, inventory, day, tod };
}
