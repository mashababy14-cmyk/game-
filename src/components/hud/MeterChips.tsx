"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { meterDefs } from "@/lib/content";
import { useGameStore } from "@/store/gameStore";

/** Compact icon meters: value + 3px bar, tap through to the status phone. */
export default function MeterChips() {
  const meters = useGameStore((s) => s.meters);
  const showIcons = useGameStore((s) => s.prefs.meterIcons);

  return (
    <Link
      href="/status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1.5"
      title="Status"
    >
      {meterDefs.map((m) => {
        const v = meters[m.id] ?? m.initial;
        const pct = Math.round(((v - m.min) / (m.max - m.min)) * 100);
        return (
          <span key={m.id} className="flex items-center gap-1.5">
            {showIcons && (
              <Icon
                name={m.icon ?? "info"}
                size={14}
                className="text-[var(--muted)]"
              />
            )}
            <span className="w-16">
              <span className="meter-track">
                <span
                  className="meter-fill"
                  style={{
                    width: `${pct}%`,
                    opacity: m.positive === false ? 0.7 : 1,
                  }}
                />
              </span>
            </span>
            <span className="w-5 text-right text-[11px] tabular-nums text-[var(--muted)]">
              {v}
            </span>
          </span>
        );
      })}
    </Link>
  );
}
