import type { InputHTMLAttributes, ReactNode } from "react";

export const inputClass =
  "w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/25 focus:border-luxury-gold outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[10px] uppercase tracking-widest text-white/45 mb-2 font-semibold"
    >
      {children}
    </label>
  );
}

/** Label + input + optional hint, the shape every form on the dashboard uses. */
export default function Field({
  id,
  label,
  hint,
  ...props
}: {
  id: string;
  label: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <input id={id} className={inputClass} {...props} />
      {hint && (
        <p className="text-[11px] text-white/30 mt-1.5 leading-relaxed">{hint}</p>
      )}
    </div>
  );
}
