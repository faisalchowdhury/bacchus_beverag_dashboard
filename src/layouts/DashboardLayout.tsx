import { useEffect, useState } from "react";
import { Outlet, useLocation, useMatch } from "react-router";

import Sidebar, { NAV_ITEMS } from "./Sidebar";
import Topbar from "./Topbar";

/** Page title for the topbar, derived from the route. */
function usePageTitle(): string {
  const { pathname } = useLocation();
  const isQuoteDetail = useMatch("/quotes/:id");

  if (isQuoteDetail) return "Quote Detail";

  const match = [...NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => (item.end ? pathname === item.path : pathname.startsWith(item.path)));

  return match?.label ?? "Dashboard";
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = usePageTitle();

  // Never leave the drawer open across a navigation.
  useEffect(() => setSidebarOpen(false), [pathname]);

  // Lock the page behind the drawer so only the drawer scrolls.
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-luxury-black">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Offset by the sidebar from lg up, where it is permanently visible. */}
      <div className="lg:pl-[var(--sidebar-w)]">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="px-4 sm:px-6 py-6 sm:py-8 max-w-[1600px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
