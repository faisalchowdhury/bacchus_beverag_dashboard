import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BellOff,
  BellRing,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  X,
} from "lucide-react";

import {
  createStaff,
  fetchNotificationRecipients,
  fetchStaff,
  removeStaff,
  resetStaffPassword,
  updateStaff,
} from "../../api/staff";
import { apiErrorMessage } from "../../api/axiosInstance";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { useToast } from "../../components/Toast";
import { formatDate } from "../../utils/format";
import type { NotificationRecipients, StaffMember } from "../../types";

/* ── Add staff form ────────────────────────────────────────────────── */

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  jobTitle: "",
  notifyOnNewQuote: true,
  notifyOnQuoteAccepted: true,
};

function AddStaffDialog({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (values: typeof EMPTY_FORM) => Promise<void>;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  // Reset between openings so a cancelled entry does not reappear.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, busy, onClose]);

  if (!open) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return setError("Their name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setError("A valid email address is required.");
    }
    setError(null);
    await onSubmit(form);
  };

  const inputClass =
    "w-full bg-luxury-black border border-white/10 rounded-xl px-4 py-3 text-sm placeholder-white/25 focus:border-luxury-gold outline-none transition-colors";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        onClick={() => !busy && onClose()}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <form
        onSubmit={submit}
        className="panel relative rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="font-serif text-xl font-bold">Add a staff member</h2>
            <p className="text-[12px] text-white/45 leading-relaxed mt-1.5">
              They will be emailed a password and can sign in here straight away.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-luxury-gold transition-colors focus-gold flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3.5">
          <div>
            <label
              htmlFor="staff-name"
              className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2"
            >
              Full name
            </label>
            <input
              id="staff-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jordan Ellis"
              autoFocus
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="staff-email"
              className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2"
            >
              Email
            </label>
            <input
              id="staff-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="jordan@example.com"
              className={inputClass}
            />
            <p className="text-[10px] text-white/25 mt-1.5 leading-relaxed">
              This is where their quote notifications go. It cannot be changed later.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="staff-title"
                className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2"
              >
                Job title
              </label>
              <input
                id="staff-title"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="Lead Bartender"
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor="staff-phone"
                className="block text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2"
              >
                Phone
              </label>
              <input
                id="staff-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
          </div>

          <fieldset className="pt-1">
            <legend className="text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2.5">
              Email them when
            </legend>
            <div className="space-y-2">
              {(
                [
                  ["notifyOnNewQuote", "A client submits a new quote"],
                  ["notifyOnQuoteAccepted", "A client accepts their quote"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 cursor-pointer hover:border-white/20 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="accent-luxury-gold w-4 h-4"
                  />
                  <span className="text-sm text-white/70">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {error && (
          <p className="text-[12px] text-amber-400 mt-4 leading-relaxed">{error}</p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="px-5 py-2.5 rounded-full border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/60 hover:border-white/30 transition-colors focus-gold disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-luxury-gold text-luxury-black text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-colors focus-gold disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
            Add staff member
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Page ──────────────────────────────────────────────────────────── */

export default function Staff() {
  const toast = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [recipients, setRecipients] = useState<NotificationRecipients | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [adding, setAdding] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<StaffMember | null>(null);

  /**
   * Shown when a password could not be emailed. The admin has to pass it on
   * by hand, and it is the only copy — so it stays on screen until dismissed
   * rather than disappearing with a toast.
   */
  const [passwordToPassOn, setPasswordToPassOn] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, lists] = await Promise.all([
        fetchStaff({ search: search.trim() || undefined }),
        // Secondary — a failure here should not blank the page.
        fetchNotificationRecipients().catch(() => null),
      ]);
      setStaff(list);
      setRecipients(lists);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load the team."));
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const onCreate = async (values: typeof EMPTY_FORM) => {
    setAddBusy(true);
    try {
      const result = await createStaff({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        jobTitle: values.jobTitle.trim() || undefined,
        notifyOnNewQuote: values.notifyOnNewQuote,
        notifyOnQuoteAccepted: values.notifyOnQuoteAccepted,
      });

      setAdding(false);
      if (result.temporaryPassword) {
        setPasswordToPassOn({
          name: result.staff.name,
          email: result.staff.email,
          password: result.temporaryPassword,
        });
      } else {
        toast.success(`${result.staff.name} has been emailed their sign-in details.`);
      }
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not add that staff member."));
    } finally {
      setAddBusy(false);
    }
  };

  /** Optimistic toggle — a notification preference is trivial to put back. */
  const onToggleNotify = async (
    member: StaffMember,
    key: "notifyOnNewQuote" | "notifyOnQuoteAccepted",
  ) => {
    const next = !member[key];
    setStaff((current) =>
      current.map((m) => (m._id === member._id ? { ...m, [key]: next } : m)),
    );

    try {
      await updateStaff(member._id, { [key]: next });
      // Recipient lists are derived server-side — refresh so they stay true.
      fetchNotificationRecipients().then(setRecipients).catch(() => {});
    } catch (err) {
      setStaff((current) =>
        current.map((m) => (m._id === member._id ? { ...m, [key]: !next } : m)),
      );
      toast.error(apiErrorMessage(err, "Could not save that preference."));
    }
  };

  const onResetPassword = async (member: StaffMember) => {
    setBusyId(member._id);
    try {
      const result = await resetStaffPassword(member._id);
      if (result.temporaryPassword) {
        setPasswordToPassOn({
          name: member.name,
          email: member.email,
          password: result.temporaryPassword,
        });
      } else {
        toast.success(`A new password has been emailed to ${member.name}.`);
      }
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not reset that password."));
    } finally {
      setBusyId(null);
    }
  };

  const onRemove = async () => {
    if (!confirmRemove) return;
    setBusyId(confirmRemove._id);
    try {
      await removeStaff(confirmRemove._id);
      toast.success(`${confirmRemove.name} has been removed from the team.`);
      setConfirmRemove(null);
      await load();
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not remove that staff member."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">Team</h1>
          <p className="text-xs text-white/40 mt-1.5 leading-relaxed max-w-lg">
            Staff can sign in to read the quote pipeline, and are emailed when a client
            submits or accepts a quote. Only admins can manage the team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-luxury-gold text-luxury-black text-[11px] uppercase tracking-widest font-semibold hover:bg-white transition-colors focus-gold flex-shrink-0"
        >
          <Plus size={14} /> Add staff
        </button>
      </div>

      {/* Password that could not be emailed */}
      {passwordToPassOn && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-amber-200">
                Pass this password on yourself
              </p>
              <p className="text-[12px] text-white/60 leading-relaxed mt-1.5">
                We could not email {passwordToPassOn.name} at{" "}
                <span className="text-white/80">{passwordToPassOn.email}</span>. This is
                the only copy — it cannot be shown again.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 min-w-0 truncate bg-luxury-black border border-white/10 rounded-lg px-3 py-2.5 text-sm font-mono text-luxury-gold">
                  {passwordToPassOn.password}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(passwordToPassOn.password)
                      .then(() => toast.success("Password copied."))
                      .catch(() => toast.error("Could not copy — select it by hand."));
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-white/10 text-[11px] uppercase tracking-widest font-semibold text-white/60 hover:border-luxury-gold/40 hover:text-luxury-gold transition-colors focus-gold flex-shrink-0"
                >
                  <Copy size={13} /> Copy
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasswordToPassOn(null)}
              aria-label="Dismiss"
              className="text-white/30 hover:text-white transition-colors flex-shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Who gets notified */}
      {recipients && (
        <div className="panel rounded-2xl p-5">
          <h2 className="text-[10px] uppercase tracking-[0.2em] text-luxury-gold font-semibold mb-4">
            Who gets notified
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {(
              [
                ["New quote submitted", recipients.newQuote],
                ["Quote accepted (contract attached)", recipients.quoteAccepted],
              ] as const
            ).map(([label, list]) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wider text-white/35 font-medium mb-2.5">
                  {label}
                </p>
                {list.length === 0 ? (
                  <p className="text-[12px] text-amber-400/80 leading-relaxed">
                    Nobody — these notifications are going nowhere.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {list.map((recipient) => (
                      <li
                        key={recipient.email}
                        className="text-[12px] text-white/60 flex items-center gap-2 min-w-0"
                      >
                        <Mail size={11} className="text-white/25 flex-shrink-0" />
                        <span className="truncate">{recipient.email}</span>
                        {recipient.role === "admin" && (
                          <span className="text-[9px] uppercase tracking-widest text-luxury-gold/60 flex-shrink-0">
                            admin
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="panel rounded-2xl p-4 sm:p-5">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the team by name, email or job title…"
            aria-label="Search staff"
            className="w-full bg-luxury-black border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm placeholder-white/25 focus:border-luxury-gold outline-none transition-colors"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-[92px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Could not load the team" message={error} />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title={search ? "Nobody matches that search" : "No staff yet"}
          message={
            search
              ? "Try a different name or email address."
              : "Add your team here and they will be emailed every time a client submits or accepts a quote."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {staff.map((member) => (
            <div key={member._id} className="panel rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-medium">{member.name}</span>
                    {member.jobTitle && (
                      <span className="text-[10px] uppercase tracking-widest text-luxury-gold/70 border border-luxury-gold/20 rounded-full px-2.5 py-0.5">
                        {member.jobTitle}
                      </span>
                    )}
                    {member.isBlocked && (
                      <span className="text-[10px] uppercase tracking-widest text-amber-400/80 border border-amber-500/25 rounded-full px-2.5 py-0.5">
                        Blocked
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-white/40 mt-1">{member.email}</div>
                  <div className="text-[10px] text-white/25 mt-1">
                    Added {formatDate(member.createdAt)}
                    {member.phone ? ` · ${member.phone}` : ""}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => onResetPassword(member)}
                    disabled={busyId === member._id}
                    title="Email them a new password"
                    aria-label={`Reset ${member.name}'s password`}
                    className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-white/35 hover:text-luxury-gold hover:bg-white/[0.05] transition-colors focus-gold disabled:opacity-40"
                  >
                    {busyId === member._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <KeyRound size={15} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(member)}
                    disabled={busyId === member._id}
                    title="Remove from the team"
                    aria-label={`Remove ${member.name}`}
                    className="inline-flex w-9 h-9 rounded-lg items-center justify-center text-white/35 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-gold disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Notification toggles */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                {(
                  [
                    ["notifyOnNewQuote", "New quotes"],
                    ["notifyOnQuoteAccepted", "Accepted quotes"],
                  ] as const
                ).map(([key, label]) => {
                  const on = member[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onToggleNotify(member, key)}
                      aria-pressed={on}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors focus-gold ${
                        on
                          ? "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/25"
                          : "border border-white/10 text-white/35 hover:text-white/60"
                      }`}
                    >
                      {on ? <BellRing size={12} /> : <BellOff size={12} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddStaffDialog
        open={adding}
        busy={addBusy}
        onClose={() => setAdding(false)}
        onSubmit={onCreate}
      />

      <ConfirmDialog
        open={Boolean(confirmRemove)}
        title={`Remove ${confirmRemove?.name ?? "this person"}?`}
        message="They will lose dashboard access immediately and stop receiving quote notifications. Quotes they were copied on keep their record of it."
        confirmLabel="Remove"
        destructive
        busy={busyId === confirmRemove?._id}
        onConfirm={onRemove}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
