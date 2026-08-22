import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_BASE ?? "http://localhost:8080";

export const TOKEN_KEY = "bacchus_admin_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

/** Every admin endpoint is behind guardRole, so attach the JWT to each call. */
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * A rejected or expired token must not leave the user staring at a broken
 * screen — drop the credential and bounce to login.
 *
 * The API answers auth failures with 200 + { success: false } in some paths
 * (sendResponse always uses the status it is given), so the response
 * interceptor checks both.
 */
api.interceptors.response.use(
  (response) => {
    const unauthorised =
      response.data?.success === false &&
      (response.data?.status === 401 || response.data?.status === 403);

    if (unauthorised && getToken()) {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && getToken()) {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  },
);

/** Pulls the human-readable message the API sends, rather than a bare status. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      (error.response ? `Server responded ${error.response.status}` : error.message)
    );
  }
  return error instanceof Error ? error.message : fallback;
}

export default api;
