import { items, shopStock } from "@/lib/content";

export function canBuy(
  s: { money: number; inventory: Record<string, number> },
  itemId: string,
): { ok: boolean; reason: string } {
  const stock = shopStock.find((e) => e.itemId === itemId);
  const item = items.find((i) => i.id === itemId);
  if (!stock || !item) return { ok: false, reason: "Item not found" };
  if (!stock.repeat && (s.inventory[itemId] ?? 0) > 0)
    return { ok: false, reason: "Already owned" };
  if (s.money < stock.price) return { ok: false, reason: "Not enough coins" };
  return { ok: true, reason: "" };
}
