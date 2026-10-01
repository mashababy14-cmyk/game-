"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { meta } from "@/lib/content";
import { useReady } from "@/lib/useReady";
import { useGameStore } from "@/store/gameStore";

export default function TitlePage() {
  const ready = useReady();
  const started = useGameStore((s) => s.started);
  const newGame = useGameStore((s) => s.newGame);
  const day = useGameStore((s) => s.day);
  const router = useRouter();

  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center px-4">
      <div className="panel w-full max-w-sm p-8 text-center">
        <p className="label">A choice-driven story</p>
        <h1 className="mt-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-4xl font-extrabold text-transparent">
          {meta.title}
        </h1>
        {meta.subtitle && (
          <p className="mt-1 text-xs text-[var(--muted)]">{meta.subtitle}</p>
        )}

        <div className="mt-7 flex justify-center gap-1">
          {started && (
            <Link className="ibtn" href="/game" title="Continue" aria-label="Continue">
              <Icon name="play" size={22} />
            </Link>
          )}
          <button
            className="ibtn"
            data-on={true}
            onClick={() => {
              newGame();
              router.push("/game");
            }}
            title="New game"
            aria-label="New game"
          >
            <Icon name="refresh" size={22} />
          </button>
          <Link className="ibtn" href="/saves" title="Saves" aria-label="Saves">
            <Icon name="save" size={22} />
          </Link>
          <Link
            className="ibtn"
            href="/settings"
            title="Settings"
            aria-label="Settings"
          >
            <Icon name="gear" size={22} />
          </Link>
        </div>

        {started && (
          <p className="mt-6 text-[11px] text-[var(--muted)]">
            Day {day} · v{meta.version} · offline
          </p>
        )}
      </div>
    </main>
  );
}
