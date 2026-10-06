import Link from "next/link";
import { ShoppingCart, User, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "./logo";
import { signOutAction } from "@/app/actions/session";
import { CatalogSearchBar } from "./catalog-search-bar";

export function PortalHeader({
  role,
  businessName,
  cartCount = 0,
  showSearch = true,
}: {
  role: "owner" | "retailer";
  businessName?: string | null;
  cartCount?: number;
  showSearch?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo href="/catalog" />

        {showSearch && (
          <div className="hidden flex-1 md:block">
            <CatalogSearchBar />
          </div>
        )}

        <nav className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link href="/catalog" className="btn-ghost hidden sm:inline-flex">
            Catalog
          </Link>
          {role === "owner" && (
            <Link href="/admin" className="btn-ghost">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}
          <Link href="/account" className="btn-ghost" aria-label="My account">
            <User className="h-4 w-4" />
            <span className="hidden lg:inline">
              {businessName || "Account"}
            </span>
          </Link>
          <Link
            href="/cart"
            className="btn-ghost relative"
            aria-label={`Cart (${cartCount} items)`}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-saddle px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="btn-ghost"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </nav>
      </div>

      {showSearch && (
        <div className="container-page pb-3 md:hidden">
          <CatalogSearchBar />
        </div>
      )}
    </header>
  );
}
