/**
 * Mirrors the API contract in bacchus_backend/src/modules/quote/. Duplicated
 * rather than shared because the projects build independently — change a field
 * in one and change it in the other.
 */

/* ── Envelope ──────────────────────────────────────────────────────── */

export interface ApiEnvelope<T> {
  success: boolean;
  status: number;
  message?: string;
  pagination?: Pagination;
  data: T;
}

export interface Pagination {
  totalPage?: number;
  currentPage?: number;
  prevPage: number | null;
  nextPage: number | null;
  limit?: number;
  totalItem?: number;
}

/* ── Auth ──────────────────────────────────────────────────────────── */

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  profilePicture?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

/* ── Users (admin management) ──────────────────────────────────────── */

export interface PlatformUser {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: string;
  profilePicture?: string | null;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string;
}

/* ── Settings pages ────────────────────────────────────────────────── */

export type SettingsPageKey = "privacy" | "terms" | "about";

export interface SettingsPage {
  _id: string;
  /** Rich text (HTML). Sanitised server-side before it is stored. */
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ── Quote wizard selections ───────────────────────────────────────── */

export type BarType = "Open Bar" | "Cash Bar" | "Consumption Bar";
export type WineBeerTier = "None" | "Tier 1" | "Tier 2" | "Tier 3";
export type LiquorTier = "Well" | "Call" | "Top Shelf" | "Platinum";
export type LiquorMode = "None" | "Signature Cocktails" | "Full Shelf";
export type ToastServiceStyle = "Stationary Display" | "Bar Cart / Table Service";
export type HouseAccountScope =
  | "Wine & Beer Only"
  | "Signature Cocktails"
  | "Liquor Shelf Tiers"
  | "Full Inventory";

export interface SignatureCocktail {
  name: string;
  liquors: string[];
}

export interface QuoteFormValues {
  eventType: string;
  eventDate: string;
  venueLocation: string;
  eventStartTime: string;
  eventEndTime: string;

  guestCount: number;
  glasswareRental: boolean;
  barType: BarType;
  additionalBarStations: number;

  wineBeerTier: WineBeerTier;
  openBarHours: number;
  specialtyOrderRequest: string;
  specialtyOrderQuantity: number;

  liquorMode: LiquorMode;
  liquorTier: LiquorTier;
  signatureCocktailCount: number;
  signatureCocktails: SignatureCocktail[];

  champagneToast: boolean;
  champagneSelection: string;
  champagneGuests: number;
  champagneNonAlcoholicGuests: number;
  toastTime: string;
  toastServiceStyle: ToastServiceStyle;

  houseAccountAmount: number;
  houseAccountScope: HouseAccountScope;
  openTab: boolean;
  tabRestrictions: string;

  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

/* ── Quote breakdown ───────────────────────────────────────────────── */

export interface QuoteLineItem {
  id: string;
  label: string;
  detail?: string;
  amount: number;
  taxExempt?: boolean;
  informational?: boolean;
}

export interface QuoteBreakdown {
  eventHours: number;
  staffedHours: number;
  openBarHours: number;
  barStations: number;
  baseBartenders: number;
  additionalBartenders: number;
  bartenderCount: number;

  glasswareFee: number;
  additionalBarSetupFee: number;
  staffingFee: number;
  wineBeerRate: number;
  wineBeerFee: number;
  liquorRate: number;
  liquorFee: number;
  beverageSubtotal: number;
  barMinimumFee: number;
  champagneFee: number;
  cashBarAdminFee: number;
  houseAccountFee: number;
  serviceFee: number;

  subtotal: number;
  gratuity: number;
  taxExemptTotal: number;
  taxableBase: number;
  tax: number;
  grandTotal: number;

  lineItems: QuoteLineItem[];
  warnings: string[];
}

/* ── Quote records ─────────────────────────────────────────────────── */

export const QUOTE_STATUSES = ["New", "Contacted", "Won", "Lost"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

/** The trimmed shape returned by the list endpoint. */
export interface QuoteListItem {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  eventType?: string;
  eventDate?: string;
  venueLocation?: string;
  guestCount: number;
  barType: BarType | string;
  grandTotal: number;
  status: QuoteStatus;
  clientEmailSent: boolean;
  ownerEmailSent: boolean;
  submittedAt: string;
  createdAt: string;
}

/** Everything the client submitted, from the detail endpoint. */
export interface QuoteDetail extends QuoteListItem {
  selections: QuoteFormValues;
  breakdown: QuoteBreakdown;
  adminNotes: string;
  updatedAt: string;
}

export interface QuoteStats {
  statusCounts: Record<QuoteStatus, number>;
  total: number;
  pipelineValue: number;
  averageValue: number;
  totalGuests: number;
  recent: QuoteListItem[];
}
