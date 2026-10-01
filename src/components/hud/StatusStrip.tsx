"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import MeterChips from "@/components/hud/MeterChips";
import { TOD_META } from "@/lib/presets";
import { useGameStore } from "@/store/gameStore";

/** Phone-style status strip shown on the story screen. */
export default function StatusStrip() {
  const day = useGameStore((s) => s.day);
  const tod = useGameStore((s) => s.tod);
  const money = useGameStore((s) => s.money);
  const t = TOD_META[tod];

  return (
    <div className="flex items-center justify-between gap-2">
      <MeterChips />
      <Link
        href="/status"
        className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px]"
        title="Status phone"
      >
        <Icon name={t.icon} size={12} className="text-[var(--muted)]" />
        <span className="tabular-nums">D{day}</span>
        <span className="text-[var(--muted)]">·</span>
        <Icon name="coin" size={12} className="text-[var(--muted)]" />
        <span className="tabular-nums">{money}</span>
      </Link>
    </div>
  );
}
