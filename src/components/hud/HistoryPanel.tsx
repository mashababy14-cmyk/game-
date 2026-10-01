"use client";

import { Icon } from "@/components/ui/Icon";
import NavRail from "@/components/hud/NavRail";
import { displayName } from "@/lib/content";
import { useGameStore } from "@/store/gameStore";

export default function HistoryPanel({ onClose }: { onClose: () => void }) {
  const history = useGameStore((s) => s.history);
  const edits = useGameStore((s) => s.edits);
  const limit = useGameStore((s) => s.prefs.historyLimit);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60"
      onClick={onClose}
    >
      <div
        className="panel m-3 flex w-full max-w-md flex-col !bg-[var(--bg-0)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
          <h2 className="text-sm font-bold">History</h2>
          <span className="text-xs text-[var(--muted)]">
            {history.length} / {limit}
          </span>
          <button className="ibtn" onClick={onClose} aria-label="Close history">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {history.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Nothing yet.</p>
          )}
          {history.map((h, i) => {
            if (h.speaker === "choice")
              return (
                <p
                  key={i}
                  className="rounded-lg border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] px-3 py-2 text-sm"
                >
                  → {h.text}
                </p>
              );
            const name =
              h.speaker === "narrator" ? "" : displayName(h.speaker, edits);
            return (
              <div key={i} className="text-sm">
                {name && (
                  <p className="font-bold" style={{ color: "var(--accent)" }}>
                    {name}
                  </p>
                )}
                <p className="text-[var(--ink)]/90">{h.text}</p>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end border-t border-[var(--line)] p-2">
          <NavRail active="/game" />
        </div>
      </div>
    </div>
  );
}
