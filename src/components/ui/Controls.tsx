"use client";

export function Switch({
  label,
  hint,
  on,
  onChange,
}: {
  label: string;
  hint?: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] py-3 last:border-b-0">
      <span className="flex flex-col">
        <span className="text-sm">{label}</span>
        {hint && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className="relative h-[26px] w-[46px] shrink-0 rounded-full border transition"
        style={{
          background: on ? "var(--accent)" : "var(--panel-2)",
          borderColor: on ? "var(--accent)" : "var(--line)",
        }}
      >
        <span
          className="absolute rounded-full bg-white transition-all"
          style={{
            width: 18,
            height: 18,
            top: 3,
            left: on ? 25 : 4,
          }}
        />
      </button>
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="border-b border-[var(--line)] py-3 last:border-b-0">
      <div className="flex items-center justify-between">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-[var(--muted)]">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--accent)]"
        aria-label={label}
      />
    </div>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { v: T; t: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="border-b border-[var(--line)] py-3 last:border-b-0">
      <span className="text-sm">{label}</span>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            className="ibtn !h-8 !min-w-0 px-3 text-xs"
            data-on={o.v === value ? "true" : undefined}
            onClick={() => onChange(o.v)}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Section({
  title,
  icon,
  children,
  aside,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="panel p-4">
      <header className="mb-1 flex items-center justify-between">
        <h2 className="label flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {aside}
      </header>
      <div>{children}</div>
    </section>
  );
}
