import { useEffect, useRef, useState } from "react";
import { Menu, LogOut, ChevronDown } from "lucide-react";

import { useAuth } from "../auth/AuthContext";

export default function Topbar({
  title,
  onMenuClick,
}: {
  title: string;
  onMenuClick: () => void;
}) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the account menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const initials = (user?.name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <header className="h-[var(--topbar-h)] sticky top-0 z-30 bg-luxury-black/85 backdrop-blur-xl border-b border-white/5 flex items-center gap-3 px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="lg:hidden p-2.5 -ml-2 text-white/70 hover:text-luxury-gold transition-colors focus-gold rounded-lg"
      >
        <Menu size={20} />
      </button>

      <h1 className="font-serif text-lg sm:text-xl font-bold truncate flex-1">{title}</h1>

      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-full border border-white/10 hover:border-luxury-gold/35 transition-colors focus-gold"
        >
          <span className="w-7 h-7 rounded-full bg-luxury-gold/15 text-luxury-gold text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
            {initials || "?"}
          </span>
          <span className="hidden sm:block text-xs font-medium text-white/70 max-w-[9rem] truncate">
            {user?.name}
          </span>
          <ChevronDown
            size={13}
            className={`text-white/40 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-60 panel rounded-xl overflow-hidden shadow-2xl shadow-black/50"
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[11px] text-white/40 truncate mt-0.5">{user?.email}</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-white/65 hover:text-luxury-gold hover:bg-white/[0.04] transition-colors focus-gold"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
