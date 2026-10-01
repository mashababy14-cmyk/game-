"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Ring } from "@/components/ui/Ring";
import NavRail from "@/components/hud/NavRail";
import { characters, displayName, displayRelationship, items, meterDefs, scenesById, locationById } from "@/lib/content";
import { TOD_META } from "@/lib/presets";
import { useGameStore } from "@/store/gameStore";

const TABS = [
  { id: "status", icon: "phone", label: "Status" },
  { id: "people", icon: "user", label: "People" },
  { id: "bag", icon: "bag", label: "Bag" },
  { id: "log", icon: "history", label: "Log" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function StatusBar() {
  const day = useGameStore((s) => s.day);
  const tod = useGameStore((s) => s.tod);
  const money = useGameStore((s) => s.money);
  const t = TOD_META[tod];
  return (
    <div className="flex items-center justify-between px-4 pb-2 pt-2.5 text-[11px]">
      <span className="flex items-center gap-1.5">
        <Icon name={t.icon} size={13} />
        <span className="tabular-nums">
          {String(Math.min(23, 6 + (["morning", "afternoon", "evening", "night"].indexOf(tod) + 1) * 4))
            .padStart(2, "0")}
          :{tod === "night" ? "41" : "12"}
        </span>
        <span className="text-[var(--muted)]">· Day {day}</span>
      </span>
      <span className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <Icon name="coin" size={12} />
          {money}
        </span>
        <span className="flex items-end gap-[2px]" aria-hidden>
          {[4, 6, 8, 10].map((h) => (
            <span
              key={h}
              className="w-[3px] rounded-sm"
              style={{ height: h, background: "var(--muted)" }}
            />
          ))}
        </span>
        <span
          className="rounded-[3px] border px-1 py-[1px] text-[9px]"
          style={{ borderColor: "var(--muted)", color: "var(--muted)" }}
        >
          82
        </span>
      </span>
    </div>
  );
}

function TabStatus() {
  const meters = useGameStore((s) => s.meters);
  const money = useGameStore((s) => s.money);
  const day = useGameStore((s) => s.day);
  const tod = useGameStore((s) => s.tod);
  const t = TOD_META[tod];

  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        {meterDefs.map((m) => (
          <Ring
            key={m.id}
            label={m.label}
            icon={m.icon}
            value={meters[m.id] ?? m.initial}
            min={m.min}
            max={m.max}
            positive={m.positive !== false}
          />
        ))}
      </div>

      <div className="space-y-1.5 rounded-xl border border-[var(--line)] p-3 text-xs">
        <Row k="Day" v={String(day)} />
        <Row k="Time" v={t.label} />
        <Row k="Coins" v={String(money)} />
        <Row k="Title" v="offline · autosave on" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link className="btn justify-start" href="/saves">
          <Icon name="save" size={15} /> Saves
        </Link>
        <Link className="btn justify-start" href="/shop">
          <Icon name="store" size={15} /> Pharmacy
        </Link>
        <Link className="btn justify-start" href="/map">
          <Icon name="map" size={15} /> Map
        </Link>
        <Link className="btn justify-start" href="/settings">
          <Icon name="gear" size={15} /> Settings
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted)]">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function TabPeople() {
  const edits = useGameStore((s) => s.edits);
  const sceneId = useGameStore((s) => s.sceneId);
  const flags = useGameStore((s) => s.flags);
  const others = characters.filter((c) => c.id !== "narrator" && c.id !== "mc");

  return (
    <div className="space-y-2 p-4">
      {others.map((c) => {
        const name = displayName(c.id, edits);
        const rel = displayRelationship(c.id, edits);
        const thumb = c.photo ?? c.photos?.[0];
        return (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
          >
            {thumb ? (
              <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-full bg-black/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt={`${name} (AI)`} className="h-full w-full object-cover" />
                {c.ai && (
                  <span className="absolute bottom-0 right-0 rounded-tl-md bg-black/70 px-1 text-[8px] font-bold text-white">
                    AI
                  </span>
                )}
              </span>
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{
                  background: "color-mix(in oklab, var(--accent) 20%, transparent)",
                  color: "var(--accent)",
                }}
              >
                {name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {name}{" "}
                {c.ai && (
                  <span className="ml-1 rounded bg-[var(--bg-0)] px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">
                    AI · photo chat / video sex
                  </span>
                )}
              </p>
              <p className="truncate text-[11px] text-[var(--muted)]">
                {rel}
                {c.gender ? ` · ${c.gender}` : ""}
                {c.videos?.length ? ` · ${c.videos.length} videos` : ""}
                {c.photos?.length ? ` · ${c.photos.length} photos` : ""}
              </p>
            </div>
            <Icon name="chevron" size={14} className="text-[var(--muted)]" />
          </div>
        );
      })}
      <p className="rounded-xl border border-[var(--line)] p-3 text-[11px] text-[var(--muted)]">
        All girls are AI-generated. No real person. Photos play in chat, videos
        play in intimate scenes.
      </p>
      <div className="rounded-xl border border-[var(--line)] p-3 text-xs text-[var(--muted)]">
        {Object.keys(flags).filter((k) => flags[k]).length
          ? `Known events: ${Object.keys(flags)
              .filter((k) => flags[k])
              .map((k) => k.replace(/_/g, " "))
              .join(", ")}`
          : "No events recorded yet."}
      </div>
    </div>
  );
}

function TabBag() {
  const inventory = useGameStore((s) => s.inventory);
  const money = useGameStore((s) => s.money);
  const useItem = useGameStore((s) => s.useItem);
  const entries = Object.entries(inventory);

  return (
    <div className="space-y-2 p-4">
      <div className="flex items-center justify-between text-xs text-[var(--muted)]">
        <span>Balance</span>
        <span className="flex items-center gap-1.5 text-[var(--ink)]">
          <Icon name="coin" size={13} /> {money}
        </span>
      </div>
      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--line)] p-6 text-center text-xs text-[var(--muted)]">
          Bag is empty. Try the pharmacy.
        </p>
      ) : (
        entries.map(([id, n]) => {
          const it = items.find((i) => i.id === id);
          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-xl border border-[var(--line)] p-3"
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon name={it?.icon ?? "bag"} size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{it?.name ?? id}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  ×{n}
                  {it?.usable === false ? " · auto-used in intimate scenes" : ""}
                </p>
              </div>
              {it?.usable === false ? (
                <span className="flex h-8 items-center px-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  auto
                </span>
              ) : (
                <button
                  className="ibtn !h-8 !min-w-8"
                  aria-label={`Use ${it?.name ?? id}`}
                  title="Use"
                  onClick={() => useItem(id)}
                >
                  <Icon name="check" size={15} />
                </button>
              )}
            </div>
          );
        })
      )}
      <Link className="btn w-full" href="/shop">
        <Icon name="store" size={15} /> Open pharmacy
      </Link>
    </div>
  );
}

function TabLog() {
  const history = useGameStore((s) => s.history);
  const edits = useGameStore((s) => s.edits);
  const sceneId = useGameStore((s) => s.sceneId);
  const here = locationById(scenesById[sceneId]?.location ?? "")?.label ?? "—";
  const recent = history.slice(-14);

  return (
    <div className="space-y-2 p-4">
      <p className="text-[11px] uppercase tracking-widest text-[var(--muted)]">
        You are at · {here}
      </p>
      {recent.length === 0 ? (
        <p className="text-xs text-[var(--muted)]">Nothing logged yet.</p>
      ) : (
        recent.map((h, i) => (
          <p key={i} className="border-l-2 border-[var(--line)] pl-3 text-xs">
            {h.speaker === "choice" ? (
              <span className="text-[var(--accent)]">› {h.text}</span>
            ) : h.speaker === "narrator" ? (
              <span className="italic text-[var(--muted)]">{h.text}</span>
            ) : (
              <>
                <span className="font-semibold">
                  {displayName(h.speaker, edits)}
                </span>
                <span className="text-[var(--ink)]/85"> {h.text}</span>
              </>
            )}
          </p>
        ))
      )}
    </div>
  );
}

export default function StatusPhone() {
  const [tab, setTab] = useState<Tab>("status");

  return (
    <div className="mx-auto w-full max-w-[400px]">
      {/* phone shell */}
      <div
        className="overflow-hidden rounded-[2rem] border border-[var(--line)] shadow-2xl"
        style={{ background: "var(--panel)" }}
      >
        {/* notch */}
        <div className="flex justify-center pt-2">
          <span className="h-1.5 w-16 rounded-full bg-[var(--bg-0)]" />
        </div>
        <StatusBar />

        <div className="min-h-[420px]">
          {tab === "status" && <TabStatus />}
          {tab === "people" && <TabPeople />}
          {tab === "bag" && <TabBag />}
          {tab === "log" && <TabLog />}
        </div>

        {/* tab bar */}
        <div className="grid grid-cols-4 border-t border-[var(--line)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              data-on={tab === t.id ? "true" : undefined}
              className="flex flex-col items-center gap-1 py-2.5 text-[10px]"
              style={{
                color: tab === t.id ? "var(--accent)" : "var(--muted)",
              }}
            >
              <Icon name={t.icon} size={17} />
              {t.label}
            </button>
          ))}
        </div>
        {/* home indicator */}
        <div className="flex justify-center pb-2">
          <span className="h-1 w-20 rounded-full bg-[var(--bg-0)]" />
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <NavRail active="/status" />
      </div>
    </div>
  );
}
