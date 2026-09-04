import api, { clearToken, setToken } from "./axiosInstance";
import { DASHBOARD_ROLES, hasDashboardAccess, type AdminUser, type ApiEnvelope } from "../types";

interface LoginResponse {
  user: AdminUser;
  token: string;
}

/**
 * Signs in against the shared auth endpoint, narrowed to the roles that may
 * open the dashboard — the same address can hold a client account as well,
 * and that one must never be what gets signed in here.
 */
export async function login(email: string, password: string): Promise<AdminUser> {
  const { data } = await api.post<ApiEnvelope<LoginResponse>>("/api/v1/auth/login", {
    email,
    password,
    role: DASHBOARD_ROLES.join(","),
  });

  if (!data.success || !data.data?.token) {
    throw new Error(data.message || "Login failed.");
  }

  if (!hasDashboardAccess(data.data.user)) {
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
