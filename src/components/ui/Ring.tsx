"use client";

import { Icon } from "@/components/ui/Icon";

export function Ring({
  value,
  min = 0,
  max = 100,
  label,
  icon,
  positive = true,
  size = 78,
}: {
  value: number;
  min?: number;
  max?: number;
  label: string;
  icon?: string;
  positive?: boolean;
  size?: number;
}) {
  const stroke = size <= 54 ? 4 : 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const grad = positive ? "var(--accent)" : "#d9a94a";
  const grad2 = positive ? "var(--accent-2)" : "#e0607f";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={grad} />
              <stop offset="100%" stopColor={grad2} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--bg-0)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={`url(#g-${label})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon name={icon ?? "info"} size={13} className="text-[var(--muted)]" />
          <span className="text-sm font-bold tabular-nums">{value}</span>
        </div>
      </div>
      <span className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
        {label}
      </span>
    </div>
  );
}
