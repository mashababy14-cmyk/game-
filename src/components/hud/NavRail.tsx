"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const ITEMS = [
  { href: "/game", icon: "play", label: "Story" },
  { href: "/map", icon: "map", label: "Map" },
  { href: "/shop", icon: "store", label: "Shop" },
  { href: "/status", icon: "phone", label: "Status" },
  { href: "/saves", icon: "save", label: "Saves" },
  { href: "/settings", icon: "gear", label: "Settings" },
  { href: "/", icon: "home", label: "Title" },
];

export default function NavRail({
  active,
  extra,
}: {
  active?: string;
  extra?: { icon: string; label: string; onClick: () => void; on?: boolean }[];
}) {
  return (
    <div className="flex items-center gap-1">
      {extra?.map((e) => (
        <button
          key={e.label}
          type="button"
          className="ibtn"
          data-on={e.on ? "true" : undefined}
          onClick={e.onClick}
          title={e.label}
          aria-label={e.label}
        >
          <Icon name={e.icon} />
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-[var(--line)]" />
      {ITEMS.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className="ibtn"
          data-on={active === i.href ? "true" : undefined}
          title={i.label}
          aria-label={i.label}
        >
          <Icon name={i.icon} />
        </Link>
      ))}
    </div>
  );
}
