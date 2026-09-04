import { Navigate, Outlet } from "react-router";

import { useAuth } from "./AuthContext";
import { isAdmin } from "../types";

/**
 * Gate for the admin-only areas inside the dashboard.
 *
 * Staff hold valid sessions and see the quote pipeline, but managing accounts
 * and site content is not theirs. The server enforces this too — this only
 * saves them a page of 403s.
 */
export default function AdminRoute() {
  const { user } = useAuth();

  if (!isAdmin(user)) return <Navigate to="/" replace />;

  return <Outlet />;
}
