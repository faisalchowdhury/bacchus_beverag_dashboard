import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  /** Marks the headline figure of a row. */
  accent?: boolean;
}) {
  return (
    <div
      className={`panel panel-hover rounded-2xl p-5 sm:p-6 ${
        accent ? "border-luxury-gold/25" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            accent
              ? "bg-luxury-gold/15 text-luxury-gold"
              : "bg-white/5 text-white/45"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>
      <div
        className={`font-serif font-bold leading-none tabular-nums ${
          accent ? "text-luxury-gold text-3xl sm:text-4xl" : "text-luxury-ivory text-2xl sm:text-3xl"
        }`}
      >
        {value}
      </div>
      {hint && (
        <p className="text-[11px] text-white/35 font-light mt-2 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
