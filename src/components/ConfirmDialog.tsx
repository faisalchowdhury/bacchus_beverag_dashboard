import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

/** Blocking confirmation for actions that change someone else's access. */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", onKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        onClick={() => !busy && onCancel()}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="panel relative rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/60"
      >
        <div className="flex items-start gap-3 mb-5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              destructive
                ? "bg-amber-500/15 text-amber-400"
                : "bg-luxury-gold/15 text-luxury-gold"
            }`}
          >
            <AlertTriangle size={17} />
          </div>
          <div className="min-w-0">
            <h2 id="confirm-title" className="font-serif text-lg font-bold">
              {title}
            </h2>
            <p className="text-[12px] text-white/50 leading-relaxed mt-1.5">{message}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-5 py-2.5 rounded-full border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/60 hover:border-white/30 transition-colors focus-gold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-semibold transition-colors focus-gold disabled:opacity-40 ${
              destructive
                ? "bg-amber-500 text-luxury-black hover:bg-amber-400"
                : "bg-luxury-gold text-luxury-black hover:bg-white"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
