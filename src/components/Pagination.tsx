import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Pagination as PaginationMeta } from "../types";

export default function Pagination({
  meta,
  onPageChange,
}: {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  if (!meta || (meta.totalPage ?? 1) <= 1) return null;

  const current = meta.currentPage ?? 1;
  const total = meta.totalPage ?? 1;

  // A window around the current page, so 40 pages does not render 40 buttons.
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, Math.max(current + 2, 5));
  const pages: number[] = [];
  for (let page = start; page <= end; page++) pages.push(page);

  const navButton =
    "w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center transition-colors focus-gold disabled:opacity-30 disabled:cursor-not-allowed hover:border-luxury-gold/40 hover:text-luxury-gold";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
      <p className="text-[11px] text-white/35 font-medium tabular-nums">
        Page {current} of {total}
        {meta.totalItem !== undefined && ` · ${meta.totalItem} total`}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(current - 1)}
          disabled={!meta.prevPage}
          aria-label="Previous page"
          className={navButton}
        >
          <ChevronLeft size={15} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={page === current ? "page" : undefined}
            className={`w-9 h-9 rounded-lg text-xs font-semibold tabular-nums transition-colors focus-gold ${
              page === current
                ? "bg-luxury-gold text-luxury-black"
                : "border border-white/10 text-white/60 hover:border-luxury-gold/40 hover:text-luxury-gold"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(current + 1)}
          disabled={!meta.nextPage}
          aria-label="Next page"
          className={navButton}
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
