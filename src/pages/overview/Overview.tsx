import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  FileText,
  Inbox,
  TrendingUp,
  Users,
} from "lucide-react";

import { fetchQuoteStats } from "../../api/quotes";
import { apiErrorMessage } from "../../api/axiosInstance";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { formatDate, money, moneyCompact, relativeTime } from "../../utils/format";
import { QUOTE_STATUSES, type QuoteStats } from "../../types";

export default function Overview() {
  const [stats, setStats] = useState<QuoteStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchQuoteStats()
      .then((data) => !cancelled && setStats(data))
      .catch((err) => !cancelled && setError(apiErrorMessage(err, "Could not load stats.")))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-[136px] rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Could not load the overview"
        message={error}
        action={
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-luxury-gold text-luxury-black text-[11px] font-semibold uppercase tracking-widest hover:bg-white transition-colors focus-gold"
          >
            Try again
          </button>
        }
      />
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No quotes yet"
        message="When someone completes the quote designer on the website, their enquiry will appear here."
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Headline figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total quotes"
          value={stats.total}
          icon={FileText}
          hint={`${stats.statusCounts.New} awaiting a first response`}
        />
        <StatCard
          label="Pipeline value"
          value={moneyCompact(stats.pipelineValue)}
          icon={DollarSign}
          accent
          hint="Combined estimate across every quote"
        />
        <StatCard
          label="Average quote"
          value={moneyCompact(stats.averageValue)}
          icon={TrendingUp}
          hint="Mean grand total"
        />
        <StatCard
          label="Guests quoted"
          value={stats.totalGuests.toLocaleString("en-US")}
          icon={Users}
          hint="Across all enquiries"
        />
      </div>

      {/* Pipeline breakdown */}
      <section>
        <h2 className="font-serif text-lg font-bold mb-4">Pipeline</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {QUOTE_STATUSES.map((status) => {
            const count = stats.statusCounts[status] ?? 0;
            const share = stats.total ? Math.round((count / stats.total) * 100) : 0;
            return (
              <Link
                key={status}
                to={`/quotes?status=${status}`}
                className="panel panel-hover rounded-2xl p-5 focus-gold block"
              >
                <StatusBadge status={status} />
                <div className="font-serif text-3xl font-bold mt-3 tabular-nums">{count}</div>
                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-luxury-gold/70 rounded-full transition-[width] duration-500"
                    style={{ width: `${share}%` }}
                  />
                </div>
                <p className="text-[10px] text-white/30 mt-2 font-medium tabular-nums">
                  {share}% of all quotes
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Latest enquiries */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="font-serif text-lg font-bold">Latest enquiries</h2>
          <Link
            to="/quotes"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-luxury-gold hover:text-white transition-colors focus-gold"
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="panel rounded-2xl divide-y divide-white/5 overflow-hidden">
          {stats.recent.map((quote) => (
            <Link
              key={quote._id}
              to={`/quotes/${quote._id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors focus-gold"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-medium text-sm truncate">{quote.customerName}</span>
                  <StatusBadge status={quote.status} />
                </div>
                <p className="text-[11px] text-white/35 mt-1 truncate">
                  {quote.eventType || "Event"} · {formatDate(quote.eventDate)} ·{" "}
                  {quote.guestCount} guests · {quote.barType}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-serif font-bold text-luxury-gold tabular-nums">
                  {money(quote.grandTotal)}
                </div>
                <p className="text-[10px] text-white/25 mt-0.5">
                  {relativeTime(quote.submittedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
