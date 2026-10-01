"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import MeterChips from "@/components/hud/MeterChips";
import StatusStrip from "@/components/hud/StatusStrip";
import NavRail from "@/components/hud/NavRail";
import HistoryPanel from "@/components/hud/HistoryPanel";
import DialogueBox from "@/components/dialogue/DialogueBox";
import ChoiceList from "@/components/dialogue/ChoiceList";
import {
  characterById,
  displayName,
  locationById,
  mediaForScene,
  sceneMode,
  scenesById,
} from "@/lib/content";
import { TOD_META, TOD_TINT } from "@/lib/presets";
import { useReady } from "@/lib/useReady";
import { useGameStore } from "@/store/gameStore";

function Media() {
  const sceneId = useGameStore((s) => s.sceneId);
  const lineIndex = useGameStore((s) => s.lineIndex);
  const edits = useGameStore((s) => s.edits);
  const tod = useGameStore((s) => s.tod);
  const [broken, setBroken] = useState(false);

  const scene = scenesById[sceneId];
  const line = scene?.lines?.[Math.min(lineIndex, (scene?.lines?.length ?? 1) - 1)];
  const media = mediaForScene(scene, {
    lineIndex,
    speaker: line?.speaker,
  });
  const mode = sceneMode(scene);
  const char = media.characterId ? characterById(media.characterId) : undefined;
  const isAi = char?.ai === true;

  // reset error state when the resolved src changes
  const srcKey = `${sceneId}:${lineIndex}:${media.src ?? "none"}`;
  useEffect(() => {
    setBroken(false);
  }, [srcKey]);

  if (!scene) return null;

  const badge = (
    <div className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1.5">
      {isAi && (
        <span className="rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
          AI
        </span>
      )}
      <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-white/85">
        {mode === "sex" ? "video · sex" : "photo · chat"}
      </span>
    </div>
  );

  const caption = char ? (
    <div className="pointer-events-none absolute bottom-2 left-2 right-2 z-10 flex items-end justify-between gap-2">
      <span className="rounded-md bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
        {displayName(char.id, edits) || char.defaultName}
      </span>
      {isAi && (
        <span className="rounded-md bg-black/45 px-1.5 py-0.5 text-[9px] text-white/75">
          AI-generated · no real person
        </span>
      )}
    </div>
  ) : null;

  if (!broken && media.kind === "video" && media.src)
    return (
      <div
        key={srcKey}
        className="panel relative w-full max-w-[560px] overflow-hidden bg-black"
      >
        {badge}
        <video
          key={media.src}
          src={media.src}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="h-[62dvh] max-h-[680px] min-h-[380px] w-full bg-black object-contain"
          onError={() => setBroken(true)}
        />
        {caption}
      </div>
    );

  if (!broken && media.kind === "photo" && media.src)
    return (
      <div
        key={srcKey}
        className="panel relative w-full max-w-[560px] overflow-hidden bg-black"
      >
        {badge}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={media.src}
          src={media.src}
          alt={char ? `${char.defaultName} (AI)` : ""}
          className="h-[62dvh] max-h-[680px] min-h-[380px] w-full bg-black object-contain"
          onError={() => setBroken(true)}
        />
        {caption}
      </div>
    );

  // gradient placeholder: location + time of day
  const loc = scene.location ? locationById(scene.location) : undefined;
  const t = TOD_META[tod];
  return (
    <div
      key={scene.id}
      className="fade panel flex w-full max-w-[560px] flex-col items-center gap-2 px-6 py-8"
      style={{
        background: `radial-gradient(120% 80% at 50% 0%, color-mix(in oklab, ${TOD_TINT[tod]} 16%, transparent), transparent 65%)`,
      }}
    >
      <Icon name={loc?.icon ?? "cloud"} size={22} className="text-[var(--muted)]" />
      <p className="text-sm font-semibold">{loc?.label ?? "—"}</p>
      <p className="text-[11px] text-[var(--muted)]">
        {loc?.zone ? `${loc.zone} · ` : ""}
        {t.label}
      </p>
      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)] opacity-70">
        no photo yet
      </p>
    </div>
  );
}

export default function GamePage() {
  const ready = useReady();
  const sceneId = useGameStore((s) => s.sceneId);
  const started = useGameStore((s) => s.started);
  const ended = useGameStore((s) => s.ended);
  const newGame = useGameStore((s) => s.newGame);
  const save = useGameStore((s) => s.saveToSlot);
  const canBack = useGameStore((s) => s.past.length > 0);
  const [history, setHistory] = useState(false);
  const [saveNote, setSaveNote] = useState<string | null>(null);

  useEffect(() => {
    if (!saveNote) return;
    const t = setTimeout(() => setSaveNote(null), 2200);
    return () => clearTimeout(t);
  }, [saveNote]);

  // Mouse back/forward side buttons: button 3 = back a line, button 4 = next
  // line. preventDefault stops the browser from leaving the page.
  useEffect(() => {
    const goBack = () => useGameStore.getState().back();
    const goNext = () => useGameStore.getState().advance();
    const onDown = (e: MouseEvent) => {
      if (e.button === 3) {
        e.preventDefault();
        goBack();
      } else if (e.button === 4) {
        e.preventDefault();
        goNext();
      }
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 3 || e.button === 4) e.preventDefault();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  if (!started)
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-4">
        <div className="panel w-full max-w-xs p-6 text-center">
          <h1 className="text-lg font-bold">No active story</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Start from the title screen.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <button className="btn btn-primary" onClick={newGame}>
              Start
            </button>
            <Link className="btn" href="/">
              Title
            </Link>
          </div>
        </div>
      </main>
    );

  return (
    <main className="flex min-h-[100dvh] flex-col">
      <div className="sticky top-0 z-20 flex flex-col gap-1.5 bg-[color-mix(in_oklab,var(--bg-0)_70%,transparent)] px-2 py-2 backdrop-blur">
        <StatusStrip />
        <div className="flex items-center justify-end gap-2">
          {saveNote && (
            <span className="pop text-[11px] text-[var(--muted)]">{saveNote}</span>
          )}
          <NavRail
            active="/game"
            extra={[
              {
                icon: "back",
                label: "Back",
                disabled: !canBack,
                onClick: () => useGameStore.getState().back(),
              },
              {
                icon: "skip",
                label: "Skip to choice",
                onClick: () => useGameStore.getState().skip(),
              },
              { icon: "history", label: "History", onClick: () => setHistory(true) },
              {
                icon: "save",
                label: "Quick save",
                onClick: () => {
                  const ok = save(0);
                  setSaveNote(ok ? "Saved to slot 1." : "Save failed — storage unavailable.");
                },
              },
            ]}
          />
        </div>
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col justify-end gap-2 px-2 pb-2">
        <div
          className="flex min-h-0 w-full flex-1 items-center justify-center px-1 py-1"
          key={sceneId}
        >
          <Media />
        </div>
        <div className="mx-auto w-full max-w-[560px] space-y-2">
          <ChoiceList />
          <DialogueBox />
        </div>
      </div>

      {ended && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/65 p-4">
          <div className="panel w-full max-w-xs p-6 text-center">
            <h2 className="text-xl font-extrabold">The End</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Chapter finished. Different choices lead elsewhere.
            </p>
            <div className="mt-5 flex justify-center gap-1">
              <Link className="ibtn" href="/map" title="Map" aria-label="Map">
                <Icon name="map" />
              </Link>
              <Link className="ibtn" href="/status" title="Status" aria-label="Status">
                <Icon name="phone" />
              </Link>
              <Link
                className="ibtn"
                href="/saves"
                title="Saves"
                aria-label="Saves"
              >
                <Icon name="save" />
              </Link>
              <button
                className="ibtn"
                onClick={newGame}
                title="Restart"
                aria-label="Restart"
              >
                <Icon name="refresh" />
              </button>
            </div>
          </div>
        </div>
      )}

      {history && <HistoryPanel onClose={() => setHistory(false)} />}
    </main>
  );
}