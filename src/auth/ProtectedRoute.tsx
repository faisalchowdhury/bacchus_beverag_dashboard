import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "./AuthContext";
import FullPageLoader from "../components/FullPageLoader";

/** Gate for everything inside the dashboard shell. */
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the boot-time token check — redirecting first would bounce a
  // signed-in admin to the login screen on every refresh.
  if (loading) return <FullPageLoader label="Checking your session…" />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
