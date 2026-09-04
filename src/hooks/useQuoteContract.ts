import { useCallback, useEffect, useRef, useState } from "react";

import { fetchQuoteContract } from "../api/quotes";
import { apiErrorMessage } from "../api/axiosInstance";
import { useToast } from "../components/Toast";

/** What the preview modal needs to show one contract. */
export interface ContractPreviewState {
  quoteId: string;
  /** Whose contract it is — shown in the modal header. */
  clientName: string;
  /** Object URL for the fetched PDF. Revoked when the preview closes. */
  url: string;
  fileName: string;
}

export interface QuoteContractApi {
  /** The quote currently being fetched, so a row can show a spinner. */
  busyId: string | null;
  preview: ContractPreviewState | null;
  openPreview: (quoteId: string, clientName: string) => Promise<void>;
  closePreview: () => void;
  download: (quoteId: string, clientName: string) => Promise<void>;
  /** Saves the contract already open in the preview — no second request. */
  downloadPreview: () => void;
}

/**
 * Fetching, previewing and saving the contract PDF for a quote.
 *
 * The endpoint is admin-only, so the PDF has to be fetched with the auth
 * header rather than linked to directly. That means every URL here is an
 * object URL over a blob we hold, and each one must be revoked — a dashboard
 * left open all day would otherwise leak a megabyte per contract viewed.
 */
export function useQuoteContract(): QuoteContractApi {
  const toast = useToast();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [preview, setPreview] = useState<ContractPreviewState | null>(null);

  // Kept in a ref as well so unmount cleanup does not need `preview` as a
  // dependency, which would revoke the URL on every state change.
  const previewUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
    },
    [],
  );

  const closePreview = useCallback(() => {
    if (previewUrl.current) {
      URL.revokeObjectURL(previewUrl.current);
      previewUrl.current = null;
    }
    setPreview(null);
  }, []);

  const openPreview = useCallback(
    async (quoteId: string, clientName: string) => {
      setBusyId(quoteId);
      try {
        const { blob, fileName } = await fetchQuoteContract(quoteId, "inline");

        // Replace any contract already open rather than stacking object URLs.
        if (previewUrl.current) URL.revokeObjectURL(previewUrl.current);
        const url = URL.createObjectURL(blob);
        previewUrl.current = url;

        setPreview({ quoteId, clientName, url, fileName });
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not open the contract."));
      } finally {
        setBusyId(null);
      }
    },
    [toast],
  );

  /** Hands a blob to the browser as a save. */
  const saveBlobUrl = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const download = useCallback(
    async (quoteId: string, clientName: string) => {
      setBusyId(quoteId);
      try {
        const { blob, fileName } = await fetchQuoteContract(quoteId, "attachment");
        const url = URL.createObjectURL(blob);
        saveBlobUrl(url, fileName);
        // Safari needs the URL to outlive the click, so revoke on the next tick.
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
        toast.success(`Contract for ${clientName} downloaded.`);
      } catch (error) {
        toast.error(apiErrorMessage(error, "Could not download the contract."));
      } finally {
        setBusyId(null);
      }
    },
    [toast],
  );

  const downloadPreview = useCallback(() => {
    if (!preview) return;
    saveBlobUrl(preview.url, preview.fileName);
  }, [preview]);

  return { busyId, preview, openPreview, closePreview, download, downloadPreview };
}
