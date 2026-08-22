import api from "./axiosInstance";
import type { ApiEnvelope, Pagination, PlatformUser } from "../types";

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  date?: string;
}

export interface UserListResult {
  users: PlatformUser[];
  pagination?: Pagination;
}

export async function fetchUsers(params: UserListParams): Promise<UserListResult> {
  const query = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== undefined),
  );

  const { data } = await api.get<ApiEnvelope<PlatformUser[]>>("/api/v1/auth/users", {
    params: query,
  });

  return { users: data.data ?? [], pagination: data.pagination };
}

export async function setUserBlocked(
  userId: string,
  isBlocked: boolean,
): Promise<PlatformUser> {
  const { data } = await api.patch<ApiEnvelope<PlatformUser>>(
    `/api/v1/auth/users/${userId}/block`,
    { isBlocked },
  );
  if (!data.data) throw new Error(data.message || "Could not update the user.");
  return data.data;
}
