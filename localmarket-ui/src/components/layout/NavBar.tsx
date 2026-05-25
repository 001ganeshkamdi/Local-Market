import { Link, NavLink } from "react-router-dom";
import { Compass, LogOut, MapPin, Search, ShoppingBag, Store, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDefaultPortalPath, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { session, logout } = useAuth();

  const links = session?.role === "buyer"
    ? [{ to: "/buyer", label: "Buyer portal", icon: ShoppingBag }]
    : session?.role === "shopkeeper"
      ? [{ to: "/shopkeeper/dashboard", label: "Shopkeeper portal", icon: Store }]
      : [
          { to: "/buyer/login", label: "Buyer login", icon: ShoppingBag },
          { to: "/shopkeeper/login", label: "Shopkeeper login", icon: Store },
        ];

  return (
    <header className="nav-shell">
      <div className="nav-content">
        <Link to={getDefaultPortalPath(session)} className="brand-mark">
          <span className="brand-icon">
            <Store className="size-4" />
          </span>
          <span>LocalMarket</span>
        </Link>

        <div className="nav-search-pill" aria-label="Marketplace search summary">
          <Search className="size-4 text-slate-500" />
          <span className="nav-search-main">
            {session?.role === "shopkeeper" ? "Manage inventory" : "Search nearby products"}
          </span>
          <span className="nav-search-divider" />
          <span className="nav-location-chip">
            <MapPin className="size-3.5" />
            Hyperlocal
          </span>
        </div>

        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn("nav-link", isActive && "nav-link-active")}
            >
              <link.icon className="size-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="nav-badge">
            <Compass className="size-4" />
            <span>{session?.role === "shopkeeper" ? "Inventory management" : "Nearby inventory"}</span>
          </div>

          {session && (
            <div className="nav-profile">
              <div className="nav-avatar">
                <UserRound className="size-4" />
              </div>
              <span>{session.role === "buyer" ? session.name : session.shopName}</span>
              <Button type="button" variant="ghost" size="icon-sm" onClick={logout} aria-label="Logout">
                <LogOut className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
