import { useEffect } from "react";
import { Download, ExternalLink, X } from "lucide-react";

import type { ContractPreviewState } from "../hooks/useQuoteContract";

/**
 * Full-screen viewer for a generated contract PDF.
 *
 * The PDF is rendered by the browser's own viewer in an iframe — no PDF.js
 * bundle to ship, and the owner gets the print, zoom and search controls they
 * already know. The blob is fetched once by `useQuoteContract`, so the Download
 * button here reuses it rather than asking the server again.
 */
export default function ContractPreview({
  preview,
  onClose,
  onDownload,
}: {
  preview: ContractPreviewState | null;
  onClose: () => void;
  onDownload: () => void;
}) {
  useEffect(() => {
    if (!preview) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [preview, onClose]);

  if (!preview) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-2 sm:p-5">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Bartending service contract for ${preview.clientName}`}
        className="panel relative rounded-2xl w-full max-w-5xl h-full flex flex-col overflow-hidden shadow-2xl shadow-black/60"
      >
        <header className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-white/5 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-base sm:text-lg font-bold truncate">
              Bartending Service Contract
            </h2>
            <p className="text-[11px] text-white/35 truncate mt-0.5">
              {preview.clientName}
            </p>
          </div>

          <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in a new tab"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/55 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold"
          >
            <ExternalLink size={13} /> New tab
          </a>

          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-luxury-gold text-luxury-black text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-colors focus-gold"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/40 hover:text-luxury-gold transition-colors focus-gold flex-shrink-0"
          >
            <X size={17} />
          </button>
        </header>

        {/* A white ground behind the viewer — a PDF page on a dark panel with
            the viewer still loading reads as a broken embed. */}
        <div className="flex-1 min-h-0 bg-neutral-200">
          <iframe
            src={preview.url}
            title={`Contract for ${preview.clientName}`}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
