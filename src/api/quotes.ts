import api from "./axiosInstance";
import type {
  ApiEnvelope,
  Pagination,
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
  barType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuoteListResult {
  quotes: QuoteListItem[];
  pagination?: Pagination;
}

export async function fetchQuotes(params: QuoteListParams): Promise<QuoteListResult> {
  // Blank filters are dropped so they do not reach the API as empty strings.
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  );

  const { data } = await api.get<ApiEnvelope<QuoteListItem[]>>("/api/v1/quote", {
    params: query,
  });

  return { quotes: data.data ?? [], pagination: data.pagination };
}

export async function fetchQuote(id: string): Promise<QuoteDetail> {
  const { data } = await api.get<ApiEnvelope<QuoteDetail>>(`/api/v1/quote/${id}`);
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

export async function fetchQuoteStats(): Promise<QuoteStats> {
  const { data } = await api.get<ApiEnvelope<QuoteStats>>("/api/v1/quote/stats");
  return data.data;
}
