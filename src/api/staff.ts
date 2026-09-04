import api from "./axiosInstance";
import type {
  ApiEnvelope,
  NotificationRecipients,
  StaffMember,
} from "../types";

/**
 * Staff management. Admin only, server-side — a staff member holding a valid
 * token still gets a 403 from every call here.
 */

export interface CreateStaffInput {
  name: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  notifyOnNewQuote?: boolean;
  notifyOnQuoteAccepted?: boolean;
  /** Left blank so the server generates one and emails it. */
  password?: string;
}

export interface CreateStaffResult {
  staff: StaffMember;
  welcomeEmailSent: boolean;
  /** Only returned when the welcome email failed, so it is not lost. */
  temporaryPassword?: string;
}

export async function fetchStaff(params: {
  search?: string;
  includeInactive?: boolean;
} = {}): Promise<StaffMember[]> {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  );

  const { data } = await api.get<ApiEnvelope<StaffMember[]>>("/api/v1/staff", {
    params: query,
  });
  return data.data ?? [];
}

export async function createStaff(input: CreateStaffInput): Promise<CreateStaffResult> {
  const { data } = await api.post<ApiEnvelope<CreateStaffResult>>("/api/v1/staff", input);
  if (!data.data) throw new Error(data.message || "Could not add that staff member.");
  return data.data;
}

export interface UpdateStaffInput {
  name?: string;
  phone?: string;
  jobTitle?: string;
  notifyOnNewQuote?: boolean;
  notifyOnQuoteAccepted?: boolean;
  isBlocked?: boolean;
}

export async function updateStaff(
  id: string,
  updates: UpdateStaffInput,
): Promise<StaffMember> {
  const { data } = await api.patch<ApiEnvelope<StaffMember>>(
    `/api/v1/staff/${id}`,
    updates,
  );
  if (!data.data) throw new Error(data.message || "Update failed.");
  return data.data;
}

export async function removeStaff(id: string): Promise<StaffMember> {
  const { data } = await api.delete<ApiEnvelope<StaffMember>>(`/api/v1/staff/${id}`);
  if (!data.data) throw new Error(data.message || "Could not remove that staff member.");
  return data.data;
}

export interface ResetStaffPasswordResult {
  emailSent: boolean;
  temporaryPassword?: string;
}

export async function resetStaffPassword(
  id: string,
): Promise<ResetStaffPasswordResult> {
  const { data } = await api.post<ApiEnvelope<ResetStaffPasswordResult>>(
    `/api/v1/staff/${id}/reset-password`,
  );
  if (!data.data) throw new Error(data.message || "Could not reset that password.");
  return data.data;
}

/**
 * Who would actually be emailed for each event.
 *
 * Read from the server rather than derived from the toggles here, so the
 * distribution list shown is the real one — admins included, blocked accounts
 * excluded, shared inboxes folded in.
 */
export async function fetchNotificationRecipients(): Promise<NotificationRecipients> {
  const { data } = await api.get<ApiEnvelope<NotificationRecipients>>(
    "/api/v1/staff/recipients",
  );
  return data.data ?? { newQuote: [], quoteAccepted: [] };
}
