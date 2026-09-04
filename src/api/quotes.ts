import api from "./axiosInstance";
import type {
  ApiEnvelope,
  Pagination,
  QuoteAcceptanceStatus,
  QuoteDetail,
  QuoteListItem,
  QuoteStats,
  QuoteStatus,
} from "../types";

export interface QuoteListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus | "";
  /** What the client did with their estimate. */
  acceptanceStatus?: QuoteAcceptanceStatus | "";
  barType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuoteListResult {
  quotes: QuoteListItem[];
  pagination?: Pagination;
}

export async function fetchQuotes(
  params: QuoteListParams,
): Promise<QuoteListResult> {
  // Blank filters are dropped so they do not reach the API as empty strings.
  const query = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== undefined,
    ),
  );

  const { data } = await api.get<ApiEnvelope<QuoteListItem[]>>(
    "/api/v1/quote",
    {
      params: query,
    },
  );

  return { quotes: data.data ?? [], pagination: data.pagination };
}

export async function fetchQuote(id: string): Promise<QuoteDetail> {
  const { data } = await api.get<ApiEnvelope<QuoteDetail>>(
    `/api/v1/quote/${id}`,
  );
  if (!data.data) throw new Error(data.message || "Quote not found.");
  return data.data;
}

export async function updateQuote(
  id: string,
  updates: { status?: QuoteStatus; adminNotes?: string },
): Promise<QuoteDetail> {
  const { data } = await api.patch<ApiEnvelope<QuoteDetail>>(
    `/api/v1/quote/${id}`,
    updates,
  );
  if (!data.data) throw new Error(data.message || "Update failed.");
  return data.data;
}

export interface QuoteContract {
  blob: Blob;
  fileName: string;
}

/**
 * The signable Bartending Service Contract for one quote, as a PDF.
 *
 * Fetched rather than linked to: the endpoint is behind `guardRole`, and a
 * plain `<a href>` cannot carry the Authorization header. The caller turns the
 * blob into an object URL to preview or save it.
 */
export async function fetchQuoteContract(
  id: string,
  disposition: "inline" | "attachment" = "inline",
): Promise<QuoteContract> {
  const response = await api.get<Blob>(`/api/v1/quote/${id}/contract`, {
    params: { disposition },
    responseType: "blob",
  });

  // An auth failure comes back as a JSON envelope with a 200, which axios has
  // happily handed us as a Blob. Read it so the user sees the real reason.
  if (response.data.type && !response.data.type.includes("pdf")) {
    const text = await response.data.text();
    let message = "The contract could not be generated.";
    try {
      message = (JSON.parse(text) as { message?: string }).message ?? message;
    } catch {
      // Not JSON either — keep the generic message.
    }
    throw new Error(message);
  }

  return {
    blob: response.data,
    fileName: fileNameFromDisposition(
      response.headers?.["content-disposition"],
      id,
    ),
  };
}

/** Prefers the server's filename; falls back to something recognisable. */
function fileNameFromDisposition(header: unknown, id: string): string {
  const raw = typeof header === "string" ? header : "";

  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(raw);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1]);
    } catch {
      // Malformed encoding — fall through to the plain filename.
    }
  }

  const plain = /filename="?([^";]+)"?/i.exec(raw);
  if (plain) return plain[1];

  return `Bacchus-Bartending-Contract-${id}.pdf`;
}

export interface ResendAcceptanceResult {
  acceptUrl: string;
  emailSent: boolean;
}

/**
 * Issues a fresh acceptance link and re-sends the estimate to the client.
 *
 * For when the client says the email never arrived, or clicked after the
 * original link aged out. Invalidates whatever link came before.
 */
export async function resendAcceptanceLink(
  id: string,
): Promise<ResendAcceptanceResult> {
  const { data } = await api.post<ApiEnvelope<ResendAcceptanceResult>>(
    `/api/v1/quote/${id}/resend-acceptance`,
  );
  if (!data.data)
    throw new Error(data.message || "Could not resend the estimate.");
  return data.data;
}

export async function fetchQuoteStats(): Promise<QuoteStats> {
  const { data } = await api.get<ApiEnvelope<QuoteStats>>(
    "/api/v1/quote/stats",
  );
  return data.data;
}
