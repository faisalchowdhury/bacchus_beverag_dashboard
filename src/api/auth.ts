import api, { clearToken, setToken } from "./axiosInstance";
import type { AdminUser, ApiEnvelope } from "../types";

interface LoginResponse {
  user: AdminUser;
  token: string;
}

/**
 * Signs in against the shared auth endpoint, pinned to the admin role — the
 * same address can hold both a client and an admin account, and the dashboard
 * only ever wants the latter.
 */
export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>("/api/v1/auth/login", {
    email,
    password,
    role: "admin",
  });

  if (!data.success || !data.data?.token) {
    throw new Error(data.message || "Login failed.");
  }

  if (data.data.user?.role !== "admin") {
    throw new Error("That account does not have dashboard access.");
  }

  setToken(data.data.token);
  return data.data.user;
}

/** Confirms the stored token is still good and returns who it belongs to. */
export async function fetchMe(): Promise<AdminUser> {
  const { data } = await api.get<ApiEnvelope<AdminUser>>("/api/v1/auth/me");
  if (!data.success || !data.data) throw new Error(data.message || "Session expired.");
  return data.data;
}

export function logout() {
  clearToken();
}
