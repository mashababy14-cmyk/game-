"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import NavRail from "@/components/hud/NavRail";
import MeterChips from "@/components/hud/MeterChips";
import { checkCondition } from "@/engine/effects";
import { locationById, mapLinks, mapLocations, meterLabel, scenesById } from "@/lib/content";
import { TOD_TINT } from "@/lib/presets";
import type { MapLocation } from "@/lib/types";
import { useGameStore } from "@/store/gameStore";
import { useState } from "react";

function requirementText(loc: MapLocation): string {
  const u = loc.unlock;
  if (!u) return "";
  const parts: string[] = [];
  if (u.meter) parts.push(`${meterLabel(u.meter)} ${u.gte !== undefined ? "≥" : "≤"} ${u.gte ?? u.lte}`);
  if (u.flag) parts.push(u.flag.replace(/_/g, " "));
  if (u.item) parts.push(`item: ${u.item}`);
  return parts.join(" · ");
}

export default function MapBoard() {
  const router = useRouter();
  const meters = useGameStore((s) => s.meters);
  const flags = useGameStore((s) => s.flags);
  const inventory = useGameStore((s) => s.inventory);
  const day = useGameStore((s) => s.day);
  const tod = useGameStore((s) => s.tod);
  const sceneId = useGameStore((s) => s.sceneId);
  const travel = useGameStore((s) => s.travel);
  const [selected, setSelected] = useState<string | null>(null);

  const hereId = scenesById[sceneId]?.location;
  const check = (l: MapLocation) =>
    checkCondition(l.unlock, { meters, flags, inventory, day, tod });
  const sel = selected ? locationById(selected) : undefined;
  const tint = TOD_TINT[tod];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-base font-bold">Map</h1>
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px]"
          >
            <Icon name="clock" size={12} className="text-[var(--muted)]" />
            Day {day} · {tod}
          </span>
          <NavRail active="/map" />
        </div>
      </div>

      <MeterChips />

      {/* board */}
      <div
        className="panel relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10]"
        style={{
          background: `radial-gradient(120% 90% at 50% -20%, color-mix(in oklab, ${tint} 22%, transparent), transparent 60%), var(--bg-0)`,
        }}
      >
        {/* connectors */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {mapLinks.map((l) => {
            const a = locationById(l.from);
            const b = locationById(l.to);
            if (!a || !b) return null;
            const live = a.id === hereId || b.id === hereId;
            return (
              <line
                key={`${l.from}-${l.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={live ? "var(--accent)" : "var(--line)"}
                strokeWidth={live ? 0.6 : 0.35}
                strokeDasharray={live ? "0" : "1.6 1.6"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* nodes */}
        {mapLocations.map((l) => {
          const unlocked = check(l);
          const isHere = l.id === hereId;
          const isSel = l.id === sel?.id;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelected(l.id)}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${l.x ?? 50}%`, top: `${l.y ?? 50}%` }}
              aria-label={l.label}
            >
              <span className="flex flex-col items-center gap-1">
                <span
                  className="relative flex h-11 w-11 items-center justify-center rounded-2xl border transition"
                  style={{
                    background: unlocked
                      ? "color-mix(in oklab, var(--accent) 18%, var(--panel))"
                      : "var(--panel-2)",
                    borderColor: isSel || isHere ? "var(--accent)" : "var(--line)",
                    color: unlocked ? "var(--accent)" : "var(--muted)",
                    boxShadow: isHere
                      ? "0 0 0 4px color-mix(in oklab, var(--accent) 22%, transparent)"
                      : undefined,
                  }}
                >
                  <Icon name={unlocked ? (l.icon ?? "map") : "lock"} size={19} />
                  {isHere && (
                    <span
                      className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full"
                      style={{ background: "var(--accent-2)" }}
                    />
                  )}
                </span>
                <span
                  className="max-w-[92px] truncate rounded bg-black/35 px-1 text-[10px]"
                  style={{ color: isSel || isHere ? "var(--ink)" : "var(--muted)" }}
                >
                  {l.label}
                </span>
              </span>
            </button>
          );
        })}

        <span className="absolute bottom-2 left-3 text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Westside block
        </span>
      </div>

      {/* detail */}
      {sel ? (
        <div className="panel fade p-4">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                color: "var(--accent)",
              }}
            >
              <Icon name={check(sel) ? (sel.icon ?? "map") : "lock"} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{sel.label}</p>
              {sel.zone && (
                <p className="text-[11px] text-[var(--muted)]">{sel.zone}</p>
              )}
              <p className="mt-1 text-xs text-[var(--muted)]">
                {check(sel) ? sel.description : requirementText(sel)}
              </p>
            </div>
            <button
              className="ibtn"
              aria-label="Close detail"
              onClick={() => setSelected(null)}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <button
              className="btn btn-primary"
              disabled={!check(sel)}
              onClick={() => {
                if (sel.page) {
                  router.push(sel.page);
                  return;
                }
                if (travel(sel.id)) router.push("/game");
              }}
            >
              {sel.page ? "Open" : check(sel) ? "Travel" : "Locked"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-[11px] text-[var(--muted)]">
          Tap a place on the board
        </p>
      )}
    </div>
  );
}
