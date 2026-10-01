"use client";

import StatusPhone from "@/components/hud/StatusPhone";
import { useReady } from "@/lib/useReady";

export default function StatusPage() {
  const ready = useReady();
  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-3 py-5">
      <StatusPhone />
    </main>
  );
}
