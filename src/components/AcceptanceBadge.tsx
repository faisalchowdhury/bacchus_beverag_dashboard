import { Check, Clock, X } from "lucide-react";

import type { QuoteAcceptanceStatus } from "../types";

/**
 * What the client did with their estimate.
 *
 * Accepted is the one that matters — it is the signal to stop chasing and
 * start contracting — so it is the only state that gets a colour with weight
 * behind it. Pending stays quiet: most quotes sit there, and a wall of amber
 * would train the eye to ignore it.
 */
const TONES: Record<
  QuoteAcceptanceStatus,
  { className: string; icon: typeof Check; label: string }
> = {
  Accepted: {
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    icon: Check,
    label: "Accepted",
  },
  Pending: {
    className: "bg-white/[0.04] text-white/40 border-white/10",
    icon: Clock,
    label: "Awaiting client",
  },
  Declined: {
    className: "bg-red-500/10 text-red-300/80 border-red-500/25",
    icon: X,
    label: "Declined",
  },
};

export default function AcceptanceBadge({
  status,
  size = "sm",
}: {
  /** Undefined on quotes submitted before acceptance tracking existed. */
  status?: QuoteAcceptanceStatus;
  size?: "sm" | "md";
}) {
  const tone = TONES[status ?? "Pending"] ?? TONES.Pending;
  const Icon = tone.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-sans font-semibold uppercase tracking-widest whitespace-nowrap ${
        size === "md" ? "px-3.5 py-1.5 text-[11px]" : "px-2.5 py-1 text-[9px]"
      } ${tone.className}`}
    >
      <Icon size={size === "md" ? 13 : 11} className="flex-shrink-0" />
      {tone.label}
    </span>
  );
}
