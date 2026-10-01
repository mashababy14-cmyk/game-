"use client";

import { Icon } from "@/components/ui/Icon";
import NavRail from "@/components/hud/NavRail";
import MeterChips from "@/components/hud/MeterChips";
import { items, meterLabel, shopStock } from "@/lib/content";
import { useReady } from "@/lib/useReady";
import { useGameStore } from "@/store/gameStore";

export default function ShopPage() {
  const ready = useReady();
  const money = useGameStore((s) => s.money);
  const inventory = useGameStore((s) => s.inventory);
  const buy = useGameStore((s) => s.buy);
  const useItem = useGameStore((s) => s.useItem);

  if (!ready)
    return (
      <main className="flex min-h-[100dvh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </main>
    );

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-2xl flex-col px-3 py-3">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h1 className="text-base font-bold">Pharmacy</h1>
        <span className="flex items-center gap-1.5 text-sm">
          <Icon name="coin" size={15} className="text-[var(--muted)]" />
          {money}
        </span>
        <NavRail active="/shop" />
      </header>
      <div className="mb-3">
        <MeterChips />
      </div>

      <div className="grid flex-1 auto-rows-min gap-2 sm:grid-cols-2">
        {shopStock.map((e) => {
          const item = items.find((i) => i.id === e.itemId);
          if (!item) return null;
          const owned = inventory[item.id] ?? 0;
          const afford = money >= e.price;
          const oneOff = !e.repeat && owned > 0;
          const fx = Object.entries(item.effect?.meters ?? {}).map(
            ([k, v]) => `${v > 0 ? "+" : ""}${v} ${meterLabel(k)}`,
          );
          return (
            <div key={item.id} className="panel p-4">
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "color-mix(in oklab, var(--accent) 16%, transparent)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon name={item.icon ?? "bag"} size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {item.description}
                  </p>
                  {fx.length > 0 && (
                    <p className="mt-1 text-[11px]" style={{ color: "var(--accent-2)" }}>
                      {fx.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs">
                  <Icon name="coin" size={13} className="text-[var(--muted)]" />
                  {e.price}
                  {owned > 0 && (
                    <span className="text-[var(--muted)]">· have {owned}</span>
                  )}
                </span>
                <span className="flex gap-1">
                  {owned > 0 && item.usable !== false && (
                    <button
                      className="ibtn !h-8 !min-w-8"
                      title={`Use ${item.name}`}
                      aria-label={`Use ${item.name}`}
                      onClick={() => useItem(item.id)}
                    >
                      <Icon name="check" size={15} />
                    </button>
                  )}
                  {owned > 0 && item.usable === false && (
                    <span
                      className="flex h-8 items-center px-1 text-[10px] uppercase tracking-wide text-[var(--muted)]"
                      title="Auto-used in intimate scenes"
                    >
                      auto
                    </span>
                  )}
                  <button
                    className="btn !py-1.5 text-xs"
                    data-on={afford && !oneOff ? "true" : undefined}
                    disabled={!afford || oneOff}
                    onClick={() => buy(item.id)}
                  >
                    {oneOff ? "Owned" : afford ? "Buy" : "No coins"}
                  </button>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
