/** Shared formatters. Money matches the backend's en-US output exactly. */

export const money = (n: number | undefined | null) =>
  `$${(Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Compact form for stat tiles, where $128,430.00 is more precision than needed. */
export const moneyCompact = (n: number | undefined | null) => {
  const value = Number.isFinite(Number(n)) ? Number(n) : 0;
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}k`;
  }
  return money(value);
};

/** "2026-09-12" → "12 Sep 2026". Falls back to the raw string. */
export const formatDate = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T00:00:00Z`)
    : new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** Date + time, for submission timestamps. */
export const formatDateTime = (value?: string | null) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return `${date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};

/** "18:00" → "6:00 PM". */
export const formatTime = (value?: string | null) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value ?? "").trim());
  if (!match) return value || "—";
  const hours = Number(match[1]);
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${match[2]} ${suffix}`;
};

/** "3 days ago" — how stale an enquiry is matters more than the exact date. */
export const relativeTime = (value?: string | null) => {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) return "";

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, secondsPer] of units) {
    if (Math.abs(seconds) >= secondsPer) {
      return formatter.format(-Math.round(seconds / secondsPer), unit);
    }
  }
  return "just now";
};
