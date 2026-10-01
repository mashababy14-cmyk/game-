"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import NavRail from "@/components/hud/NavRail";
import {
  deleteSlot,
  exportSnapshot,
  importSnapshot,
  readSlot,
  SLOT_COUNT,
} from "@/engine/saves";
import { TOD_META } from "@/lib/presets";
import { useReady } from "@/lib/useReady";
import { useGameStore } from "@/store/gameStore";

export default function SavesPage() {
  const ready = useReady();
  const router = useRouter();
  const saveToSlot = useGameStore((s) => s.saveToSlot);
  const loadFromSlot = useGameStore((s) => s.loadFromSlot);
  const [, bump] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const importTarget = useRef(0);

  useEffect(() => {
    bump((n) => n + 1);
  }, []);

  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-3 py-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h1 className="text-base font-bold">Saves</h1>
        <NavRail active="/saves" />
      </header>
      <p className="mb-3 text-[11px] text-[var(--muted)]">
        Autosave keeps the current run. Slots hold 6 manual copies — export as
        JSON to move them between phones.
      </p>

      <div className="grid flex-1 auto-rows-min gap-2 sm:grid-cols-2">
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const snap = readSlot(i);
          const tod = snap ? TOD_META[snap.tod] : null;
          return (
            <div key={i} className="panel p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Slot {i + 1}</p>
                <span className="text-[11px] text-[var(--muted)]">
                  {snap ? `Day ${snap.day}` : "empty"}
                </span>
              </div>
              {snap && tod && (
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                  <Icon name={tod.icon} size={12} />
                  {tod.label} · {snap.sceneId}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1">
                <button
                  className="ibtn !h-8 !min-w-8"
                  title="Save here"
                  aria-label={`Save to slot ${i + 1}`}
                  onClick={() => {
                    saveToSlot(i);
                    bump((n) => n + 1);
                  }}
                >
                  <Icon name="save" size={15} />
                </button>
                <button
                  className="ibtn !h-8 !min-w-8"
                  title="Load"
                  aria-label={`Load slot ${i + 1}`}
                  disabled={!snap}
                  onClick={() => {
                    if (loadFromSlot(i)) router.push("/game");
                  }}
                >
                  <Icon name="upload" size={15} />
                </button>
                <button
                  className="ibtn !h-8 !min-w-8"
                  title="Export JSON"
                  aria-label={`Export slot ${i + 1}`}
                  disabled={!snap}
                  onClick={() => exportSnapshot(i, `story-slot-${i + 1}.json`)}
                >
                  <Icon name="download" size={15} />
                </button>
                <button
                  className="ibtn !h-8 !min-w-8"
                  title="Import JSON"
                  aria-label={`Import into slot ${i + 1}`}
                  onClick={() => {
                    importTarget.current = i;
                    fileRef.current?.click();
                  }}
                >
                  <Icon name="upload" size={15} />
                </button>
                <button
                  className="ibtn !h-8 !min-w-8"
                  title="Delete"
                  aria-label={`Delete slot ${i + 1}`}
                  disabled={!snap}
                  onClick={() => {
                    deleteSlot(i);
                    bump((n) => n + 1);
                  }}
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await importSnapshot(f, importTarget.current);
          e.target.value = "";
          bump((n) => n + 1);
        }}
      />
    </main>
  );
}
