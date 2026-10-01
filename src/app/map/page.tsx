"use client";

import MapBoard from "@/components/map/MapBoard";
import { useReady } from "@/lib/useReady";

export default function MapPage() {
  const ready = useReady();
  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col gap-3 px-3 py-3">
      <MapBoard />
    </main>
  );
}
