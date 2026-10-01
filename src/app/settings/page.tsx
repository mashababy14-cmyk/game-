"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import NavRail from "@/components/hud/NavRail";
import { Section, Segmented, Slider, Switch } from "@/components/ui/Controls";
import { characters, meta } from "@/lib/content";
import {
  ACCENTS,
  AUTO_ADVANCE,
  FONT_SIZES,
  HISTORY_LIMITS,
} from "@/lib/presets";
import { clearSave } from "@/engine/save";
import { clearSlots } from "@/engine/saves";
import { useReady } from "@/lib/useReady";
import { useGameStore } from "@/store/gameStore";

export default function SettingsPage() {
  const ready = useReady();
  const prefs = useGameStore((s) => s.prefs);
  const setPref = useGameStore((s) => s.setPref);
  const edits = useGameStore((s) => s.edits);
  const setEdit = useGameStore((s) => s.setEdit);
  const resetAll = useGameStore((s) => s.resetAll);
  const day = useGameStore((s) => s.day);
  const sceneId = useGameStore((s) => s.sceneId);

  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  const editable = characters.filter((c) => (c.editable ?? []).length > 0);

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-3 py-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h1 className="text-base font-bold">Settings</h1>
        <NavRail active="/settings" />
      </header>

      <div className="flex-1 space-y-3">
        <Section title="Accent" icon={<Icon name="sparkle" size={13} />}>
          <div className="flex flex-wrap gap-2 py-3">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                type="button"
                aria-label={a.label}
                title={a.label}
                onClick={() => setPref("accent", a.key)}
                className="h-9 w-9 rounded-full border-2 transition"
                style={{
                  background: `linear-gradient(135deg, ${a.accent}, ${a.accent2})`,
                  borderColor:
                    prefs.accent === a.key ? "var(--ink)" : "transparent",
                }}
              />
            ))}
          </div>
        </Section>

        <Section title="Text" icon={<Icon name="eye" size={13} />}>
          <Slider
            label="Typewriter speed"
            value={prefs.textSpeed}
            min={0}
            max={80}
            display={prefs.textSpeed === 0 ? "instant" : `${prefs.textSpeed} ms`}
            onChange={(v) => setPref("textSpeed", v)}
          />
          <Slider
            label="Auto-advance"
            value={prefs.autoAdvance}
            min={0}
            max={5000}
            step={200}
            display={
              prefs.autoAdvance === 0
                ? "off"
                : `${(prefs.autoAdvance / 1000).toFixed(1)}s`
            }
            onChange={(v) => setPref("autoAdvance", v)}
          />
          <Segmented
            label="Font size"
            value={prefs.fontSize}
            options={FONT_SIZES.map((s) => ({ v: s, t: `${s}` }))}
            onChange={(v) => setPref("fontSize", v)}
          />
          <Segmented
            label="History length"
            value={prefs.historyLimit}
            options={HISTORY_LIMITS.map((s) => ({ v: s, t: `${s}` }))}
            onChange={(v) => setPref("historyLimit", v)}
          />
          <Switch
            label="Tap anywhere to advance"
            hint="Off = only the dialogue box responds"
            on={prefs.tapAnywhere}
            onChange={(v) => setPref("tapAnywhere", v)}
          />
        </Section>

        <Section title="Interface" icon={<Icon name="list" size={13} />}>
          <Switch
            label="Meter icons in HUD"
            on={prefs.meterIcons}
            onChange={(v) => setPref("meterIcons", v)}
          />
          <Switch
            label="Animations"
            hint="Typewriter pop and fades"
            on={prefs.motion}
            onChange={(v) => setPref("motion", v)}
          />
        </Section>

        <Section title="Characters" icon={<Icon name="user" size={13} />}>
          <p className="pb-2 text-[11px] text-[var(--muted)]">
            All girls are AI-generated — no real person. Photo = chat, video =
            sex.
          </p>
          {editable.map((c) => {
            const e = edits[c.id] ?? {};
            const ed = c.editable ?? [];
            const thumb = c.photo ?? c.photos?.[0];
            return (
              <div
                key={c.id}
                className="space-y-2 border-b border-[var(--line)] py-3 last:border-b-0"
              >
                <div className="flex items-center gap-2.5">
                  {thumb ? (
                    <span className="block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt={`${c.defaultName} (AI)`}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0">
                    <p className="label">
                      {c.role === "side" ? "Side" : "Main"} · {c.id}
                      {c.ai && (
                        <span className="ml-1.5 rounded bg-black/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                          AI
                        </span>
                      )}
                    </p>
                    {c.ai && (
                      <p className="text-[11px] text-[var(--muted)]">
                        {c.photos?.length ?? 0} photos for chat ·{" "}
                        {c.videos?.length ?? 0} videos for sex
                      </p>
                    )}
                  </div>
                </div>
                {ed.includes("name") && (
                  <div>
                    <p className="text-xs text-[var(--muted)]">Name</p>
                    <input
                      className="field mt-1"
                      value={e.name ?? c.defaultName}
                      maxLength={24}
                      onChange={(ev) => setEdit(c.id, "name", ev.target.value)}
                    />
                  </div>
                )}
                {ed.includes("relationship") && (
                  <div>
                    <p className="text-xs text-[var(--muted)]">Relationship</p>
                    <input
                      className="field mt-1"
                      value={e.relationship ?? c.defaultRelationship ?? ""}
                      maxLength={28}
                      placeholder="e.g. Neighbour"
                      onChange={(ev) =>
                        setEdit(c.id, "relationship", ev.target.value)
                      }
                    />
                  </div>
                )}
                {ed.includes("gender") && (
                  <div>
                    <p className="text-xs text-[var(--muted)]">Gender</p>
                    <div className="mt-1 flex gap-1.5">
                      {["", "male", "female", "other"].map((g) => (
                        <button
                          key={g || "none"}
                          type="button"
                          className="ibtn !h-8 !min-w-0 px-3 text-xs"
                          data-on={(e.gender ?? c.gender ?? "") === g ? "true" : undefined}
                          onClick={() => setEdit(c.id, "gender", g)}
                        >
                          {g || "—"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </Section>

        <Section title="Data" icon={<Icon name="save" size={13} />}>
          <div className="flex flex-wrap gap-1 py-3">
            <Link className="btn" href="/saves">
              <Icon name="save" size={15} /> Save slots
            </Link>
            <Link className="btn" href="/status">
              <Icon name="phone" size={15} /> Status
            </Link>
          </div>
          <p className="pb-2 text-[11px] text-[var(--muted)]">
            Current run: day {day} · {sceneId}
          </p>
          <Switch
            label="Reset everything"
            hint="Erase autosave, slots, names and progress"
            on={false}
            onChange={() => {
              if (window.confirm("Erase all saves, names and progress?")) {
                clearSave();
                clearSlots();
                resetAll();
              }
            }}
          />
        </Section>

        <p className="pb-6 text-center text-[11px] text-[var(--muted)]">
          {meta.title} v{meta.version} · static export · plays offline
        </p>
      </div>
    </main>
  );
}
