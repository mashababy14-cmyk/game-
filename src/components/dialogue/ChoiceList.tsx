"use client";

import { checkCondition } from "@/engine/effects";
import { scenesById } from "@/lib/content";
import { useGameStore } from "@/store/gameStore";

export default function ChoiceList() {
  const sceneId = useGameStore((s) => s.sceneId);
  const lineIndex = useGameStore((s) => s.lineIndex);
  const meters = useGameStore((s) => s.meters);
  const flags = useGameStore((s) => s.flags);
  const inventory = useGameStore((s) => s.inventory);
  const day = useGameStore((s) => s.day);
  const tod = useGameStore((s) => s.tod);
  const choose = useGameStore((s) => s.choose);
  const fallback = useGameStore((s) => s.fallback);

  const scene = scenesById[sceneId];
  if (!scene?.choices || scene.choices.length === 0) return null;
  if (lineIndex < scene.lines.length) return null;

  const visible = scene.choices.filter((c) =>
    checkCondition(c.condition, { meters, flags, inventory, day, tod }),
  );

  if (visible.length === 0)
    return (
      <button className="btn btn-primary pop w-full" onClick={fallback}>
        Continue
      </button>
    );

  return (
    <div className="pop space-y-2">
      {visible.map((c, i) => (
        <button
          key={i}
          type="button"
          onClick={() => choose(c)}
          className="panel group flex w-full items-center gap-3 px-4 py-3 text-left text-[15px] transition enabled:hover:border-[var(--accent)]"
        >
          <span
            className="h-5 w-[3px] shrink-0 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span className="flex-1">{c.text}</span>
        </button>
      ))}
    </div>
  );
}
