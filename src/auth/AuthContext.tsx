import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fetchMe, login as loginRequest, logout as clearSession } from "../api/auth";
import { getToken } from "../api/axiosInstance";
import { hasDashboardAccess, type AdminUser } from "../types";

interface AuthState {
  user: AdminUser | null;
  /** True until the stored token has been checked — routes wait on this. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  /** Re-reads the signed-in account, after a profile edit for instance. */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  /*
   * A token in localStorage is not proof of a valid session — it may be
   * expired or revoked. Verify it against /me once on boot so a stale token
   * never renders the shell and then fails on every request inside it.
   */
  useEffect(() => {
    let cancelled = false;

    if (!getToken()) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then((me) => {
        if (!cancelled) setUser(hasDashboardAccess(me) ? me : null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setUser(await loginRequest(email, password));
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setUser(await fetchMe());
    } catch {
      // The interceptor already handles an expired token; a failed refresh
      // should not blank the UI mid-edit.
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh }),
    [user, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.");
  return context;
}
