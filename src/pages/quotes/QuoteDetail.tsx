import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Mail,
  MailX,
  Phone,
  Save,
  Send,
} from "lucide-react";

import { fetchQuote, resendAcceptanceLink, updateQuote } from "../../api/quotes";
import { apiErrorMessage } from "../../api/axiosInstance";
import StatusBadge from "../../components/StatusBadge";
import AcceptanceBadge from "../../components/AcceptanceBadge";
import EmptyState from "../../components/EmptyState";
import ContractActions from "../../components/ContractActions";
import ContractPreview from "../../components/ContractPreview";
import { useQuoteContract } from "../../hooks/useQuoteContract";
import { formatDate, formatDateTime, formatTime, money } from "../../utils/format";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../components/Toast";
import {
  QUOTE_STATUSES,
  isAdmin,
  type QuoteDetail as Quote,
  type QuoteStatus,
} from "../../types";

/* ── Layout helpers ────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel rounded-2xl p-5 sm:p-6">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-5">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Definition rows. Stacks on narrow screens rather than crushing two columns. */
function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-white/5">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2.5 first:pt-0 last:pb-0"
        >
          <dt className="text-[11px] uppercase tracking-wider text-white/35 font-medium sm:w-[42%] flex-shrink-0">
            {label}
          </dt>
          <dd className="text-sm text-white/80 font-light break-words min-w-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const yesNo = (value: boolean) => (value ? "Yes" : "No");

/* ── Page ──────────────────────────────────────────────────────────── */

export default function QuoteDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState<QuoteStatus>("New");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const contract = useQuoteContract();
  const toast = useToast();
  const { user } = useAuth();

  const [resending, setResending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchQuote(id)
      .then((data) => {
        if (cancelled) return;
        setQuote(data);
        setStatus(data.status);
        setNotes(data.adminNotes ?? "");
      })
      .catch((err) => !cancelled && setError(apiErrorMessage(err, "Could not load the quote.")))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const dirty = useMemo(
    () => Boolean(quote) && (status !== quote?.status || notes !== (quote?.adminNotes ?? "")),
    [quote, status, notes],
  );

  const onSave = async () => {
    if (!quote) return;
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await updateQuote(quote._id, { status, adminNotes: notes });
      setQuote(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(apiErrorMessage(err, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-10 w-40 rounded-lg" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <div className="skeleton h-64 rounded-2xl" />
            <div className="skeleton h-80 rounded-2xl" />
          </div>
          <div className="skeleton h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Quote unavailable"
        message={error ?? "That quote could not be found."}
        action={
          <button
            type="button"
            onClick={() => navigate("/quotes")}
            className="px-5 py-2.5 rounded-full bg-luxury-gold text-luxury-black text-[11px] font-semibold uppercase tracking-widest hover:bg-white transition-colors focus-gold"
          >
            Back to quotes
          </button>
        }
      />
    );
  }

  const s = quote.selections;
  const b = quote.breakdown;
  const isOpenBar = s.barType === "Open Bar";
  const cocktailCount = Math.min(Math.max(Math.round(s.signatureCocktailCount) || 0, 0), 4);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to="/quotes"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-semibold text-white/40 hover:text-luxury-gold transition-colors focus-gold mb-3"
          >
            <ArrowLeft size={13} /> All quotes
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold flex items-center gap-3 flex-wrap">
            {quote.customerName}
            <StatusBadge status={quote.status} size="md" />
            <AcceptanceBadge status={quote.acceptanceStatus} size="md" />
          </h1>
          <p className="text-xs text-white/35 mt-1.5">
            Submitted {formatDateTime(quote.submittedAt)}
          </p>
        </div>

        <div className="flex flex-col items-end gap-4 flex-shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-semibold mb-1">
              Estimated total
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-luxury-gold tabular-nums leading-none">
              {money(b.grandTotal)}
            </div>
          </div>

          <ContractActions
            variant="labelled"
            clientName={quote.customerName}
            busy={contract.busyId === quote._id}
            onView={() => contract.openPreview(quote._id, quote.customerName)}
            onDownload={() => contract.download(quote._id, quote.customerName)}
          />
        </div>
      </div>

      {/* Delivery warning — the client may never have received their copy. */}
      {!quote.clientEmailSent && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
          <MailX size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-white/70 leading-relaxed">
            The estimate email was <strong>not delivered</strong> to this client. They may be
            waiting on a copy they will never receive — worth reaching out directly.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* ── Left: what the client submitted ──────────────────────── */}
        <div className="xl:col-span-2 space-y-5">
          <Section title="Client">
            <Facts
              rows={[
                ["Name", s.customerName],
                [
                  "Email",
                  <a
                    href={`mailto:${s.customerEmail}`}
                    className="inline-flex items-center gap-1.5 text-luxury-gold hover:text-white transition-colors focus-gold"
                  >
                    <Mail size={13} /> {s.customerEmail}
                  </a>,
                ],
                [
                  "Phone",
                  s.customerPhone ? (
                    <a
                      href={`tel:${s.customerPhone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-luxury-gold hover:text-white transition-colors focus-gold"
                    >
                      <Phone size={13} /> {s.customerPhone}
                    </a>
                  ) : (
                    "—"
                  ),
                ],
                [
                  "Estimate email",
                  quote.clientEmailSent ? "Delivered" : "Not delivered",
                ],
                [
                  "Venue notified",
                  quote.ownerEmailSent ? "Delivered" : "Not delivered",
                ],
              ]}
            />
          </Section>

          <Section title="Event">
            <Facts
              rows={[
                ["Event type", s.eventType || "—"],
                ["Date", formatDate(s.eventDate)],
                ["Venue / location", s.venueLocation || "—"],
                [
                  "Service window",
                  `${formatTime(s.eventStartTime)} – ${formatTime(s.eventEndTime)} (${b.eventHours} hrs)`,
                ],
                ["Staffed hours", `${b.staffedHours} hrs (includes 1 hr setup + 1 hr teardown)`],
                ["Total guests", `${s.guestCount} (including minors)`],
              ]}
            />
          </Section>

          <Section title="Bar setup">
            <Facts
              rows={[
                ["Bar type", s.barType],
                ["Glassware rental", s.glasswareRental ? "Bacchus rental" : "Client supplied"],
                [
                  "Bar stations",
                  `${b.barStations} (1 permanent + ${s.additionalBarStations} additional)`,
                ],
                [
                  "Bartenders",
                  `${b.bartenderCount} (${b.baseBartenders} by guest count + ${b.additionalBartenders} for extra stations)`,
                ],
                ...(isOpenBar
                  ? ([["Open Bar hours", `${b.openBarHours} of ${b.eventHours} hrs`]] as [
                      string,
                      ReactNode,
                    ][])
                  : []),
              ]}
            />
          </Section>

          <Section title="Beverage selections">
            <Facts
              rows={[
                [
                  "Beer & wine tier",
                  isOpenBar
                    ? `${s.wineBeerTier}${b.wineBeerRate ? ` · ${money(b.wineBeerRate)} / guest / hr` : ""}`
                    : "Not preselected",
                ],
                [
                  "Liquor",
                  !isOpenBar
                    ? "Not preselected"
                    : s.liquorMode === "None"
                      ? "None"
                      : s.liquorMode === "Full Shelf"
                        ? `Full ${s.liquorTier} shelf · ${money(b.liquorRate)} / guest / hr`
                        : `${cocktailCount} × ${s.liquorTier} signature cocktails · ${money(b.liquorRate)} / guest / hr`,
                ],
                [
                  "Specialty request",
                  s.specialtyOrderRequest?.trim()
                    ? `${s.specialtyOrderRequest}${s.specialtyOrderQuantity ? ` (qty ${s.specialtyOrderQuantity})` : ""}`
                    : "None",
                ],
              ]}
            />

            {isOpenBar && s.liquorMode === "Signature Cocktails" && cocktailCount > 0 && (
              <div className="mt-5 pt-5 border-t border-white/5">
                <h3 className="text-[10px] uppercase tracking-wider text-white/35 font-medium mb-3">
                  Named cocktails
                </h3>
                <div className="space-y-2">
                  {Array.from({ length: cocktailCount }).map((_, i) => {
                    const cocktail = s.signatureCocktails?.[i];
                    const named = cocktail?.name?.trim();
                    return (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-4 rounded-lg bg-luxury-black/50 border border-white/5 px-4 py-3"
                      >
                        <span
                          className={`text-sm font-medium ${named ? "" : "text-amber-400/70 italic"}`}
                        >
                          {named || `Cocktail #${i + 1} — unnamed`}
                        </span>
                        <span className="text-xs text-white/45 sm:text-right">
                          {cocktail?.liquors?.length
                            ? cocktail.liquors.join(" + ")
                            : "No liquors chosen"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Section>

          {s.champagneToast && (
            <Section title="Champagne toast">
              <Facts
                rows={[
                  ["Selection", s.champagneSelection],
                  ["Guests receiving champagne", `${s.champagneGuests}`],
                  ["Sparkling grape juice", `${s.champagneNonAlcoholicGuests}`],
                  ["Toast time", formatTime(s.toastTime)],
                  ["Service style", s.toastServiceStyle],
                ]}
              />
            </Section>
          )}

          {(s.barType === "Consumption Bar" || s.barType === "Cash Bar") && (
            <Section title="Account options">
              <Facts
                rows={
                  s.barType === "Consumption Bar"
                    ? [
                        ["Prepaid house account", money(b.houseAccountFee)],
                        ["Requested amount", money(s.houseAccountAmount)],
                        ["Account scope", s.houseAccountScope],
                      ]
                    : [
                        ["Host tab requested", yesNo(s.openTab)],
                        ["Tab restrictions", s.tabRestrictions?.trim() || "None specified"],
                      ]
                }
              />
            </Section>
          )}

          {/* Itemised breakdown */}
          <Section title="Itemised proposal">
            <div className="-mx-5 sm:-mx-6 overflow-x-auto">
              <table className="w-full text-sm min-w-[420px]">
                <tbody>
                  {b.lineItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-white/5 ${item.informational ? "opacity-45" : ""}`}
                    >
                      <td className="px-5 sm:px-6 py-3 align-top">
                        <div className="font-medium text-white/85">{item.label}</div>
                        {item.detail && (
                          <div className="text-[11px] text-white/35 mt-1 leading-snug">
                            {item.detail}
                            {item.taxExempt && (
                              <span className="text-luxury-gold/70"> · tax exempt</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 sm:px-6 py-3 text-right align-top tabular-nums whitespace-nowrap text-white/85">
                        {money(item.amount)}
                      </td>
                    </tr>
                  ))}

                  <tr className="border-b border-white/5">
                    <td className="px-5 sm:px-6 py-3 font-semibold">Subtotal</td>
                    <td className="px-5 sm:px-6 py-3 text-right font-semibold tabular-nums">
                      {money(b.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-2 text-white/45 text-xs">Gratuity</td>
                    <td className="px-5 sm:px-6 py-2 text-right text-white/45 text-xs tabular-nums">
                      {money(b.gratuity)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 sm:px-6 py-2 text-white/45 text-xs">
                      Tax (on {money(b.taxableBase)})
                    </td>
                    <td className="px-5 sm:px-6 py-2 text-right text-white/45 text-xs tabular-nums">
                      {money(b.tax)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      className="px-5 sm:px-6 pb-3 text-[10px] text-white/25 leading-snug"
                    >
                      Tax base = subtotal + gratuity − {money(b.taxExemptTotal)} exempt
                      (staffing, prepaid house account).
                    </td>
                  </tr>
                  <tr className="bg-luxury-black/60">
                    <td className="px-5 sm:px-6 py-4 font-serif font-bold text-luxury-gold">
                      Grand total
                    </td>
                    <td className="px-5 sm:px-6 py-4 text-right font-serif text-xl font-bold text-luxury-gold tabular-nums">
                      {money(b.grandTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {b.warnings.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-4 space-y-2">
                {b.warnings.map((warning) => (
                  <div key={warning} className="flex items-start gap-2.5">
                    <AlertTriangle size={12} className="text-amber-400 mt-1 flex-shrink-0" />
                    <p className="text-[11px] text-white/60 leading-relaxed">{warning}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── Right: the admin's working panel ─────────────────────── */}
        <div className="xl:sticky xl:top-[calc(var(--topbar-h)+1.5rem)] space-y-5">
          <Section title="Client acceptance">
            {quote.acceptanceStatus === "Accepted" ? (
              <>
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4 mb-5">
                  <CheckCircle2
                    size={16}
                    className="text-emerald-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-emerald-200">
                      Accepted by the client
                    </p>
                    <p className="text-[11px] text-white/50 leading-relaxed mt-1">
                      {formatDateTime(quote.acceptedAt)}
                    </p>
                  </div>
                </div>

                <Facts
                  rows={[
                    ...(quote.acceptanceNotifiedEmails?.length
                      ? ([
                          [
                            "Contract sent to",
                            <span className="text-[12px] leading-relaxed">
                              {quote.acceptanceNotifiedEmails.join(", ")}
                            </span>,
                          ],
                        ] as [string, ReactNode][])
                      : ([["Contract sent to", "Nobody — the email failed"]] as [
                          string,
                          ReactNode,
                        ][])),
                    ...(quote.acceptanceIp
                      ? ([
                          [
                            "Accepted from",
                            <span className="font-mono text-[11px]">
                              {quote.acceptanceIp}
                            </span>,
                          ],
                        ] as [string, ReactNode][])
                      : []),
                  ]}
                />
              </>
            ) : (
              <>
                <p className="text-[12px] text-white/50 leading-relaxed mb-4">
                  This client has not accepted yet. Their estimate email carries an
                  Accept button; accepting notifies the team and attaches the contract
                  automatically.
                </p>

                {quote.acceptanceTokenExpiresAt && (
                  <p className="text-[11px] text-white/30 leading-relaxed mb-4">
                    Their acceptance link is valid until{" "}
                    {formatDate(quote.acceptanceTokenExpiresAt)}.
                  </p>
                )}

                {isAdmin(user) && (
                  <button
                    type="button"
                    onClick={async () => {
                      setResending(true);
                      try {
                        const result = await resendAcceptanceLink(quote._id);
                        toast[result.emailSent ? "success" : "error"](
                          result.emailSent
                            ? `The estimate has been resent to ${quote.customerEmail}.`
                            : "A new link was issued, but the email could not be sent.",
                        );
                        setQuote(await fetchQuote(quote._id));
                      } catch (err) {
                        toast.error(
                          apiErrorMessage(err, "Could not resend the estimate."),
                        );
                      } finally {
                        setResending(false);
                      }
                    }}
                    disabled={resending}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 rounded-full text-[11px] uppercase tracking-widest font-semibold text-white/65 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold disabled:opacity-40"
                  >
                    {resending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send size={13} /> Resend estimate with a fresh link
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </Section>

          <Section title="Manage">
            <label className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2.5">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {QUOTE_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  aria-pressed={status === option}
                  className={`py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors focus-gold ${
                    status === option
                      ? "bg-luxury-gold text-luxury-black"
                      : "border border-white/10 text-white/55 hover:border-luxury-gold/40 hover:text-luxury-gold"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <label
              htmlFor="admin-notes"
              className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2.5"
            >
              Internal notes
            </label>
            <textarea
              id="admin-notes"
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private to the venue — never shown to the client or included in any email."
              className="w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/25 focus:border-luxury-gold outline-none transition-colors resize-y"
            />

            {saveError && (
              <p className="text-[11px] text-amber-400 mt-3 leading-relaxed">{saveError}</p>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={!dirty || saving}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors focus-gold disabled:opacity-35 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving…
                </>
              ) : saved ? (
                <>
                  <Check size={14} /> Saved
                </>
              ) : (
                <>
                  <Save size={14} /> Save changes
                </>
              )}
            </button>
          </Section>

          <Section title="Record">
            <Facts
              rows={[
                ["Quote ID", <span className="font-mono text-xs">{quote._id}</span>],
                ["Submitted", formatDateTime(quote.submittedAt)],
                ["Last updated", formatDateTime(quote.updatedAt)],
              ]}
            />
          </Section>
        </div>
      </div>

      <ContractPreview
        preview={contract.preview}
        onClose={contract.closePreview}
        onDownload={contract.downloadPreview}
      />
    </div>
  );
}
