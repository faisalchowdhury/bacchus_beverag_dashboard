import type { QuoteStatus } from "../types";

/** Won reads warm, Lost recedes, New draws the eye — it is the actionable one. */
const TONES: Record<QuoteStatus, string> = {
  New: "bg-luxury-gold/15 text-luxury-gold border-luxury-gold/30",
  Contacted: "bg-blue-400/10 text-blue-300 border-blue-400/25",
  Won: "bg-emerald-500/10 text-emerald-300 border-emerald-500/25",
  Lost: "bg-white/5 text-white/35 border-white/10",
};

export default function StatusBadge({
  status,
  size = "sm",
}: {
  status: QuoteStatus;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans font-semibold uppercase tracking-widest whitespace-nowrap ${
        size === "md" ? "px-3.5 py-1.5 text-[11px]" : "px-2.5 py-1 text-[9px]"
      } ${TONES[status] ?? TONES.Lost}`}
    >
      {status}
    </span>
  );
}
