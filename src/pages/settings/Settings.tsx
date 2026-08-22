import { useEffect, useState } from "react";
import { Eye, Loader2, Pencil, Save } from "lucide-react";

import {
  SETTINGS_PAGES,
  fetchSettingsPage,
  updateSettingsPage,
} from "../../api/settings";
import { apiErrorMessage } from "../../api/axiosInstance";
import { useToast } from "../../components/Toast";
import type { SettingsPageKey } from "../../types";

type Mode = "write" | "preview";

export default function Settings() {
  const toast = useToast();

  const [active, setActive] = useState<SettingsPageKey>("privacy");
  const [mode, setMode] = useState<Mode>("write");

  const [draft, setDraft] = useState("");
  /** What the server last confirmed, so we know when there is something to save. */
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const page = SETTINGS_PAGES.find((entry) => entry.key === active)!;
  const dirty = draft !== saved;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setMode("write");

    fetchSettingsPage(active)
      .then((result) => {
        if (cancelled) return;
        const description = result?.description ?? "";
        setDraft(description);
        setSaved(description);
      })
      .catch((err) => {
        if (!cancelled) toast.error(apiErrorMessage(err, "Could not load this page."));
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
    // toast is stable; re-running on it would refetch on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Warn before losing an unsaved edit to a tab switch or a closed tab.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const switchTo = (key: SettingsPageKey) => {
    if (key === active) return;
    if (dirty && !window.confirm("You have unsaved changes. Discard them?")) return;
    setActive(key);
  };

  const onSave = async () => {
    if (!draft.trim()) {
      toast.error("The page content cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const result = await updateSettingsPage(active, draft);
      // Read back what the server stored — it sanitises HTML, so the saved
      // text can differ from what was typed.
      setSaved(result.description);
      setDraft(result.description);
      toast.success(`${page.label} updated.`);
    } catch (err) {
      toast.error(apiErrorMessage(err, "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page picker */}
      <div className="flex flex-wrap gap-2">
        {SETTINGS_PAGES.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => switchTo(entry.key)}
            aria-pressed={entry.key === active}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-colors focus-gold ${
              entry.key === active
                ? "bg-luxury-gold text-luxury-black"
                : "border border-white/10 text-white/55 hover:border-luxury-gold/40 hover:text-luxury-gold"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h2 className="font-serif text-xl font-bold">{page.label}</h2>
            <p className="text-[11px] text-white/35 mt-1 leading-relaxed">{page.blurb}</p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg border border-white/10 flex-shrink-0">
            {(["write", "preview"] as Mode[]).map((option) => {
              const Icon = option === "write" ? Pencil : Eye;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  aria-pressed={mode === option}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-colors focus-gold ${
                    mode === option
                      ? "bg-luxury-gold/15 text-luxury-gold"
                      : "text-white/45 hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="skeleton h-[420px] rounded-xl" />
        ) : mode === "write" ? (
          <>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              spellCheck
              placeholder="Write the page content. Basic HTML is supported — <h2>, <p>, <ul>, <li>, <strong>, <em>, <a>."
              className="w-full h-[420px] bg-luxury-black border border-white/10 rounded-xl px-4 py-3.5 text-sm leading-relaxed font-mono placeholder-white/25 focus:border-luxury-gold outline-none transition-colors resize-y"
            />
            <p className="text-[11px] text-white/30 mt-2.5 leading-relaxed">
              HTML is sanitised on the server before it is stored, so unsupported tags
              are stripped on save. Switch to Preview to see the result.
            </p>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white text-[#2e2a24] p-6 h-[420px] overflow-y-auto">
            {draft.trim() ? (
              /*
               * The website renders this same block, and the server sanitises it
               * on save — so previewing it as HTML shows what visitors get.
               */
              <div
                className="settings-preview"
                dangerouslySetInnerHTML={{ __html: draft }}
              />
            ) : (
              <p className="text-[#9a8a71] text-sm italic">Nothing to preview yet.</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 pt-5 border-t border-white/5">
          <p className="text-[11px] text-white/30">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </p>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving || loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-luxury-gold text-luxury-black font-semibold text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors focus-gold disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={14} /> Save {page.label}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
