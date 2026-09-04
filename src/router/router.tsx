import { createBrowserRouter, Navigate } from "react-router";

import ProtectedRoute from "../auth/ProtectedRoute";
import AdminRoute from "../auth/AdminRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Login from "../pages/login/Login";
import Overview from "../pages/overview/Overview";
import QuoteList from "../pages/quotes/QuoteList";
import QuoteDetail from "../pages/quotes/QuoteDetail";
import Users from "../pages/users/Users";
import Staff from "../pages/staff/Staff";
import Settings from "../pages/settings/Settings";
import Account from "../pages/account/Account";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Overview /> },
          { path: "/quotes", element: <QuoteList /> },
          { path: "/quotes/:id", element: <QuoteDetail /> },
          // Admin-only areas. AdminRoute redirects staff rather than showing
          // them a page whose every request would 403.
          {
            element: <AdminRoute />,
            children: [
              { path: "/staff", element: <Staff /> },
              { path: "/users", element: <Users /> },
              { path: "/settings", element: <Settings /> },
            ],
          },
          { path: "/account", element: <Account /> },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
