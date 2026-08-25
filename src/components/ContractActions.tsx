import { Download, FileText, Loader2 } from "lucide-react";

/**
 * View / download buttons for a quote's contract PDF.
 *
 * `icon` is for table rows and cards, where space is tight; `labelled` is for
 * the detail page header, where the actions need to be obvious.
 */
export default function ContractActions({
  clientName,
  busy = false,
  variant = "icon",
  onView,
  onDownload,
}: {
  clientName: string;
  busy?: boolean;
  variant?: "icon" | "labelled";
  onView: () => void;
  onDownload: () => void;
}) {
  if (variant === "labelled") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/65 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
          View contract
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={busy}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-luxury-gold text-luxury-black text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={13} />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onView}
        disabled={busy}
        title={`View ${clientName}'s contract`}
        aria-label={`View ${clientName}'s contract`}
        className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-white/35 hover:text-luxury-gold hover:bg-white/[0.05] transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        title={`Download ${clientName}'s contract`}
        aria-label={`Download ${clientName}'s contract`}
        className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-white/35 hover:text-luxury-gold hover:bg-white/[0.05] transition-colors focus-gold disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Download size={15} />
      </button>
    </div>
  );
}
