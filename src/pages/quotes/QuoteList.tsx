import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronRight,
  Download,
  FileText,
  Inbox,
  Loader2,
  MailX,
  Search,
} from "lucide-react";

import { fetchQuotes } from "../../api/quotes";
import { apiErrorMessage } from "../../api/axiosInstance";
import StatusBadge from "../../components/StatusBadge";
import AcceptanceBadge from "../../components/AcceptanceBadge";
import EmptyState from "../../components/EmptyState";
import Pagination from "../../components/Pagination";
import ContractActions from "../../components/ContractActions";
import ContractPreview from "../../components/ContractPreview";
import { useQuoteContract } from "../../hooks/useQuoteContract";
import { formatDate, money, relativeTime } from "../../utils/format";
import {
  QUOTE_ACCEPTANCE_STATUSES,
  QUOTE_STATUSES,
  type Pagination as PaginationMeta,
  type QuoteAcceptanceStatus,
  type QuoteListItem,
  type QuoteStatus,
} from "../../types";

const SORT_OPTIONS = [
  { value: "submittedAt", label: "Date submitted" },
  { value: "eventDate", label: "Event date" },
  { value: "grandTotal", label: "Quote value" },
  { value: "guestCount", label: "Guest count" },
  { value: "customerName", label: "Client name" },
];

const BAR_TYPES = ["Open Bar", "Cash Bar", "Consumption Bar"];

export default function QuoteList() {
  /*
   * Filters live in the URL so a filtered view is shareable, survives a
   * refresh, and the browser Back button behaves as expected after opening
   * a quote and returning.
   */
  const [params, setParams] = useSearchParams();

  const page = Number(params.get("page")) || 1;
  const status = (params.get("status") ?? "") as QuoteStatus | "";
  const acceptanceStatus = (params.get("acceptanceStatus") ?? "") as
    | QuoteAcceptanceStatus
    | "";
  const barType = params.get("barType") ?? "";
  const sortBy = params.get("sortBy") ?? "submittedAt";
  const sortOrder = params.get("sortOrder") === "asc" ? "asc" : "desc";
  const search = params.get("search") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contract = useQuoteContract();

  /** Writes a filter to the URL, resetting to page 1 unless paging. */
  const setParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.delete("page");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  // Debounce the search box so typing does not fire a request per keystroke.
  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => setParam("search", searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput, search, setParam]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchQuotes({
      page,
      limit: 10,
      search,
      status,
      acceptanceStatus,
      barType,
      sortBy,
      sortOrder,
    })
      .then((result) => {
        if (cancelled) return;
        setQuotes(result.quotes);
        setMeta(result.pagination);
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, "Could not load quotes.")))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [page, search, status, acceptanceStatus, barType, sortBy, sortOrder]);

  const hasFilters = Boolean(search || status || acceptanceStatus || barType);

  const selectClass =
    "bg-luxury-black border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white/70 focus:border-luxury-gold outline-none transition-colors cursor-pointer";

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="panel rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, phone, venue or event type…"
            aria-label="Search quotes"
            className="w-full bg-luxury-black border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder-white/25 focus:border-luxury-gold outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={acceptanceStatus}
            onChange={(e) => setParam("acceptanceStatus", e.target.value)}
            aria-label="Filter by what the client did"
            className={selectClass}
          >
            <option value="">Accepted &amp; pending</option>
            {QUOTE_ACCEPTANCE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option === "Pending" ? "Awaiting client" : option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setParam("status", e.target.value)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="">All statuses</option>
            {QUOTE_STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={barType}
            onChange={(e) => setParam("barType", e.target.value)}
            aria-label="Filter by bar type"
            className={selectClass}
          >
            <option value="">All bar types</option>
            {BAR_TYPES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setParam("sortBy", e.target.value)}
            aria-label="Sort by"
            className={selectClass}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setParam("sortOrder", sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Ascending" : "Descending"}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-white/10 text-xs text-white/60 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold"
          >
            <ArrowUpDown size={13} />
            {sortOrder === "asc" ? "Asc" : "Desc"}
          </button>

          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setParams(new URLSearchParams(), { replace: true });
              }}
              className="px-3 py-2.5 rounded-lg text-xs text-white/40 hover:text-luxury-gold transition-colors focus-gold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-[74px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Could not load quotes" message={error} />
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={hasFilters ? "Nothing matches those filters" : "No quotes yet"}
          message={
            hasFilters
              ? "Try a different search term, or clear the filters to see everything."
              : "When someone completes the quote designer on the website, their enquiry will appear here."
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="panel rounded-2xl overflow-hidden hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    "Client",
                    "Event",
                    "Guests",
                    "Bar type",
                    "Value",
                    "Client",
                    "Status",
                    "Contract",
                    "",
                  ].map((heading, i) => (
                    <th
                      key={heading || i}
                      className={`px-5 py-3.5 text-[10px] uppercase tracking-widest text-white/35 font-semibold whitespace-nowrap ${
                        i >= 2 && i <= 4 ? "text-right" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <Link to={`/quotes/${quote._id}`} className="block focus-gold">
                        <div className="font-medium flex items-center gap-2">
                          {quote.customerName}
                          {!quote.clientEmailSent && (
                            <MailX
                              size={13}
                              className="text-amber-400/80 flex-shrink-0"
                              aria-label="Estimate email was not delivered"
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-white/35 mt-0.5">
                          {quote.customerEmail}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-white/75">{quote.eventType || "—"}</div>
                      <div className="text-[11px] text-white/35 mt-0.5">
                        {formatDate(quote.eventDate)}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums text-white/70">
                      {quote.guestCount}
                    </td>
                    <td className="px-5 py-4 text-right text-white/60 whitespace-nowrap text-xs">
                      {quote.barType}
                    </td>
                    <td className="px-5 py-4 text-right font-serif font-bold text-luxury-gold tabular-nums whitespace-nowrap">
                      {money(quote.grandTotal)}
                    </td>
                    <td className="px-5 py-4">
                      <AcceptanceBadge status={quote.acceptanceStatus} />
                      {quote.acceptedAt && (
                        <div className="text-[10px] text-emerald-400/50 mt-1.5">
                          {relativeTime(quote.acceptedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={quote.status} />
                      <div className="text-[10px] text-white/25 mt-1.5">
                        {relativeTime(quote.submittedAt)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ContractActions
                        clientName={quote.customerName}
                        busy={contract.busyId === quote._id}
                        onView={() =>
                          contract.openPreview(quote._id, quote.customerName)
                        }
                        onDownload={() =>
                          contract.download(quote._id, quote.customerName)
                        }
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/quotes/${quote._id}`}
                        aria-label={`Open ${quote.customerName}'s quote`}
                        className="inline-flex w-8 h-8 rounded-lg items-center justify-center text-white/25 group-hover:text-luxury-gold transition-colors focus-gold"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            Mobile / tablet cards — an 8-column table cannot survive 400px.
            The card is a div, not a Link: the contract buttons are interactive
            and must not sit inside an anchor.
          */}
          <div className="space-y-2.5 lg:hidden">
            {quotes.map((quote) => (
              <div key={quote._id} className="panel panel-hover rounded-xl p-4">
                <Link to={`/quotes/${quote._id}`} className="block focus-gold">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span className="truncate">{quote.customerName}</span>
                        {!quote.clientEmailSent && (
                          <MailX size={12} className="text-amber-400/80 flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-white/35 truncate mt-0.5">
                        {quote.customerEmail}
                      </div>
                      <div className="mt-2">
                        <AcceptanceBadge status={quote.acceptanceStatus} />
                      </div>
                    </div>
                    <StatusBadge status={quote.status} />
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div className="text-[11px] text-white/40 leading-relaxed min-w-0">
                      {quote.eventType || "Event"} · {formatDate(quote.eventDate)}
                      <br />
                      {quote.guestCount} guests · {quote.barType}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-serif font-bold text-luxury-gold tabular-nums">
                        {money(quote.grandTotal)}
                      </div>
                      <div className="text-[10px] text-white/25 mt-0.5">
                        {relativeTime(quote.submittedAt)}
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => contract.openPreview(quote._id, quote.customerName)}
                    disabled={contract.busyId === quote._id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-semibold text-white/55 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold disabled:opacity-40"
                  >
                    {contract.busyId === quote._id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <FileText size={12} />
                    )}
                    View contract
                  </button>
                  <button
                    type="button"
                    onClick={() => contract.download(quote._id, quote.customerName)}
                    disabled={contract.busyId === quote._id}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-white/10 text-[10px] uppercase tracking-widest font-semibold text-white/55 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold disabled:opacity-40"
                  >
                    <Download size={12} />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination meta={meta} onPageChange={(next) => setParam("page", String(next))} />
        </>
      )}

      <ContractPreview
        preview={contract.preview}
        onClose={contract.closePreview}
        onDownload={contract.downloadPreview}
      />
    </div>
  );
}
