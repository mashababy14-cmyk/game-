"use client";

import { useEffect, useRef, useState } from "react";
import {
  characterById,
  displayName,
  displayRelationship,
  mediaForScene,
  scenesById,
} from "@/lib/content";
import { isAwaitingChoice } from "@/engine/runner";
import { useGameStore } from "@/store/gameStore";
import { Icon } from "@/components/ui/Icon";

export default function DialogueBox() {
  const sceneId = useGameStore((s) => s.sceneId);
  const lineIndex = useGameStore((s) => s.lineIndex);
  const prefs = useGameStore((s) => s.prefs);
  const edits = useGameStore((s) => s.edits);
  const advance = useGameStore((s) => s.advance);
  const lastChoice = useGameStore((s) => s.lastChoiceText);

  const scene = scenesById[sceneId];
  const lines = scene?.lines ?? [];
  const line =
    lines.length > 0 ? lines[Math.min(lineIndex, lines.length - 1)] : undefined;
  const full = line?.text ?? "";

  const [shown, setShown] = useState(0);
  const key = `${sceneId}:${lineIndex}`;
  const typing = shown < full.length;
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShown(prefs.textSpeed <= 0 ? full.length : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, prefs.textSpeed]);

  useEffect(() => {
    if (prefs.textSpeed <= 0 || shown >= full.length) return;
    const t = setTimeout(
      () => setShown((n) => Math.min(n + 1, full.length)),
      prefs.textSpeed,
    );
    return () => clearTimeout(t);
  }, [shown, full, prefs.textSpeed]);

  // auto-advance after the line is fully shown
  useEffect(() => {
    if (prefs.autoAdvance <= 0 || typing) return;
    if (isAwaitingChoice({ sceneId, lineIndex })) return;
    const t = setTimeout(() => advance(), prefs.autoAdvance);
    return () => clearTimeout(t);
  }, [shown, typing, prefs.autoAdvance, sceneId, lineIndex, advance]);

  const step = () => {
    if (typing) setShown(full.length);
    else advance();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      const el = document.activeElement;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      e.preventDefault();
      step();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing, full]);

  // "tap anywhere" advance: ignore clicks on controls and inside the box
  useEffect(() => {
    if (!prefs.tapAnywhere) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (boxRef.current?.contains(t)) return;
      if (t.closest("button, a, input, select, textarea, [data-no-advance]"))
        return;
      step();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.tapAnywhere, typing, full, sceneId, lineIndex]);

  if (!line) return null;

  const isNarrator = line.speaker === "narrator";
  const name = isNarrator ? "" : displayName(line.speaker, edits);
  const rel = isNarrator ? "" : displayRelationship(line.speaker, edits);
  const waitChoice = isAwaitingChoice({ sceneId, lineIndex });
  // Chat avatar matches the main panel: photo for chat (stable-random gallery).
  const speakerChar = isNarrator ? undefined : characterById(line.speaker);
  const avatarMedia =
    isNarrator || !scene
      ? undefined
      : mediaForScene(scene, { lineIndex, speaker: line.speaker });
  const avatarSrc =
    avatarMedia?.kind === "photo" ? avatarMedia.src : speakerChar?.photo;
  const avatarAi = speakerChar?.ai === true;

  return (
    <div
      ref={boxRef}
      onClick={step}
      className="panel relative px-4 pb-3 pt-5"
    >
      {name && (
        <div
          className="absolute -top-3 left-4 flex items-center gap-2 rounded-lg py-1 pl-1 pr-3 text-[12px] font-bold"
          style={{
            background: "linear-gradient(90deg,var(--accent),var(--accent-2))",
            color: "#10121a",
          }}
        >
          {avatarSrc ? (
            <span className="relative block h-6 w-6 shrink-0 overflow-hidden rounded-md bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            </span>
          ) : null}
          {name}
          {avatarAi && (
            <span className="rounded bg-black/40 px-1 py-0.5 text-[9px] font-bold tracking-wide text-white">
              AI
            </span>
          )}
          {rel && (
            <span className="rounded bg-black/25 px-1.5 py-0.5 text-[10px] font-medium">
              {rel}
            </span>
          )}
        </div>
      )}

      <p
        key={key}
        className={`dtext pop min-h-[3.2rem] whitespace-pre-wrap ${
          isNarrator ? "italic text-[var(--muted)]" : ""
        }`}
      >
        {full.slice(0, shown)}
        {typing && (
          <span className="ml-0.5" style={{ color: "var(--accent)" }}>
            ▍
          </span>
        )}
      </p>

      <div className="mt-1.5 flex items-center justify-between text-[11px] text-[var(--muted)]">
        <span className="truncate pr-2">
          {lastChoice ? `› ${lastChoice}` : ""}
        </span>
        {prefs.autoAdvance > 0 && !waitChoice ? (
          <span className="flex shrink-0 items-center gap-1">
            <Icon name="clock" size={11} /> auto
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1">
            {typing ? "tap · complete" : waitChoice ? "choose" : "tap · next"}
            <Icon name="chevron" size={11} />
          </span>
        )}
      </div>
    </div>
  );
}
