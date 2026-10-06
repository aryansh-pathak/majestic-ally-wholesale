"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  Inbox,
  Settings,
  ExternalLink,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/retailers", label: "Retailers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/leads", label: "Inquiries", icon: Inbox },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-700 text-cream"
                : "text-brand-800/70 hover:bg-brand-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        );
      })}
      <Link
        href="/catalog"
        className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-800/70 hover:bg-brand-100"
      >
        <ExternalLink className="h-4 w-4" />
        View storefront
      </Link>
    </nav>
  );
}
