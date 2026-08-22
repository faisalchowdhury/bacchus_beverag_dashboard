import { Loader2 } from "lucide-react";

export default function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-luxury-black">
      <Loader2 size={26} className="animate-spin text-luxury-gold" />
      <p className="text-xs uppercase tracking-[0.25em] text-white/40 font-medium">
        {label}
      </p>
    </div>
  );
}
