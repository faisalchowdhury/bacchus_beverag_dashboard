import api from "./axiosInstance";
import type { AdminUser, ApiEnvelope } from "../types";

export interface ProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  /** Replaces the avatar when present. */
  profilePicture?: File | null;
}

/**
 * The endpoint accepts multipart because it also takes an avatar upload, so
 * the whole update goes as FormData whether or not a file is attached.
 */
export async function updateProfile(update: ProfileUpdate): Promise<AdminUser> {
  const form = new FormData();
  if (update.name) form.append("name", update.name);
  if (update.email) form.append("email", update.email);
  if (update.phone) form.append("phone", update.phone);
  if (update.address) form.append("address", update.address);
  if (update.profilePicture) form.append("profilePicture", update.profilePicture);

  const { data } = await api.patch<ApiEnvelope<AdminUser>>("/api/v1/auth/me", form, {
    // Let the browser set the multipart boundary; a manual value breaks it.
    headers: { "Content-Type": undefined },
  });

  if (!data.data) throw new Error(data.message || "Could not update your profile.");
  return data.data;
}

export async function changePassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const { data } = await api.post<ApiEnvelope<null>>("/api/v1/auth/change-password", {
    oldPassword,
    newPassword,
  });
  if (!data.success) throw new Error(data.message || "Could not change your password.");
}
