const P: Record<string, string> = {
  play: "M7 4.5v15l12-7.5z",
  pause: "M9 5v14M15 5v14",
  map: "M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zM9 4v13M15 6.5v13",
  store: "M4 9h16l-1 11H5L4 9zM8.5 9V6.5a3.5 3.5 0 0 1 7 0V9",
  bag: "M6 8h12l-1 12H7L6 8zM9 8V6.5a3 3 0 0 1 6 0V8",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3.5 2",
  save: "M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6",
  folder: "M4 6h5l2 2h9v11H4z",
  history: "M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4M12 8v4.5l3 1.8",
  home: "M4 11l8-6.5 8 6.5M6.5 9.5V20h11V9.5",
  back: "M15 5l-7 7 7 7",
  close: "M6 6l12 12M18 6L6 18",
  chevron: "M6 9.5l6 6 6-6",
  coin: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5v9M9.5 10h5M9.5 14h5",
  heart: "M12 20s-7-4.4-7-9.2A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.8C19 15.6 12 20 12 20z",
  shield: "M12 3.5l7 2.5v5c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-2.5z",
  zap: "M13.5 3 6 13.5h5L10.5 21 18 10.5h-5L13.5 3z",
  lock: "M6.5 10.5h11v9h-11zM9 10.5V8a3 3 0 0 1 6 0v2.5",
  check: "M5 12.5l4.5 4.5L19 7.5",
  trash: "M5 7h14M9.5 7V5h5v2M7 7l1 13h8l1-13",
  download: "M12 4v11M8 11.5l4 4 4-4M5 20h14",
  upload: "M12 20V9M8 12.5l4-4 4 4M5 4h14",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z",
  cloud: "M7 18h10a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.2A3.6 3.6 0 0 0 7 18z",
  list: "M8 7h11M8 12h11M8 17h11M4.5 7h.01M4.5 12h.01M4.5 17h.01",
  refresh: "M19 12a7 7 0 1 1-2.1-5M19 4v4h-4",
  phone: "M8 4h8v16H8zM11 17h2",
  user: "M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.5-3.6 4-5.2 7-5.2s5.5 1.6 7 5.2",
  eye: "M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12zM12 14.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z",
  dots: "M6 12h.01M12 12h.01M18 12h.01",
  calendar: "M4.5 6.5h15v13h-15zM8 4v4M16 4v4",
  volume: "M5 10h3l4-3.5v11L8 14H5zM15.5 9.5a3.5 3.5 0 0 1 0 5",
  sparkle: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01",
};

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.6,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const d = P[name] ?? P.info;
  const filled = name === "play" || name === "zap" || name === "sparkle";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
