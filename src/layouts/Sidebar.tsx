import { NavLink } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  UsersRound,
  FileCog,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { isAdmin } from "../types";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  /** Starts a new visual group in the sidebar. */
  groupStart?: boolean;
  /** Hidden from staff — these areas are admin-only. */
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", path: "/", icon: LayoutDashboard, end: true },
  { label: "Quotes", path: "/quotes", icon: FileText },
  { label: "Team", path: "/staff", icon: UsersRound, adminOnly: true },
  { label: "Users", path: "/users", icon: Users, adminOnly: true },
  {
    label: "Site Pages",
    path: "/settings",
    icon: FileCog,
    groupStart: true,
    adminOnly: true,
  },
  { label: "My Account", path: "/account", icon: UserCog },
];

/** The items this account may actually open. */
export const visibleNavItems = (user: { role?: string } | null | undefined): NavItem[] =>
  NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin(user));

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const items = visibleNavItems(user);

  return (
    <>
      {/* Backdrop, mobile only */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[var(--sidebar-w)] bg-luxury-charcoal border-r border-white/5 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-[var(--topbar-h)] flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-widest text-luxury-ivory leading-none">
              BACCHUS
            </span>
            <span className="text-[8px] tracking-[0.3em] text-luxury-gold font-sans font-semibold uppercase mt-1">
              {isAdmin(user) ? "Admin" : "Team"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="lg:hidden p-2 -mr-2 text-white/60 hover:text-luxury-gold transition-colors focus-gold rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {items.map(({ label, path, icon: Icon, end, groupStart }) => (
            <div key={path} className={groupStart ? "pt-4 mt-4 border-t border-white/5" : ""}>
              <NavLink
                to={path}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors focus-gold ${
                    isActive
                      ? "bg-luxury-gold/10 text-luxury-gold"
                      : "text-white/55 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon size={17} className="flex-shrink-0" />
                {label}
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-white/5 flex-shrink-0">
          <p className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium">
            © {new Date().getFullYear()} Bacchus Beverages
          </p>
        </div>
      </aside>
    </>
  );
}
