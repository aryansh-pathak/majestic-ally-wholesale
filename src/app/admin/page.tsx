import Link from "next/link";
import {
  Package,
  Users,
  ShoppingBag,
  Inbox,
  DollarSign,
  Truck,
} from "lucide-react";
import { getDashboardStats, listAllOrders, listLeads } from "@/lib/admin";
import { formatCents } from "@/lib/utils";
import { SyncButton } from "./sync-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, orders, leads] = await Promise.all([
    getDashboardStats(),
    listAllOrders(),
    listLeads(),
  ]);
  const recentOrders = orders.slice(0, 5);
  const recentLeads = leads.slice(0, 5);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Dashboard</h1>
          <p className="mt-1 text-sm text-brand-800/60">
            {stats.lastSync
              ? `Catalog last synced ${new Date(stats.lastSync).toLocaleString("en-US")}`
              : "Catalog not yet synced from Shopify"}
          </p>
        </div>
        <SyncButton />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={<DollarSign className="h-5 w-5" />} label="Paid revenue" value={formatCents(stats.revenueCents)} />
        <Stat icon={<ShoppingBag className="h-5 w-5" />} label="Orders" value={String(stats.orders)} sub={`${stats.pendingFulfil} to fulfill`} href="/admin/orders" />
        <Stat icon={<Package className="h-5 w-5" />} label="Products live" value={`${stats.visibleProducts}/${stats.products}`} href="/admin/products" />
        <Stat icon={<Users className="h-5 w-5" />} label="Retailers" value={String(stats.retailers)} href="/admin/retailers" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-brand-800/50">No orders yet.</p>
          ) : (
            <div className="divide-y divide-brand-100">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <span className="font-medium text-brand-900">#{o.id}</span>{" "}
                    <span className="text-brand-800/60">{o.business}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="badge bg-brand-100 capitalize text-brand-700">
                      {o.status}
                    </span>
                    <span className="font-semibold">{formatCents(o.totalCents)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent inquiries */}
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-brand-900">Recent inquiries</h2>
            <Link href="/admin/leads" className="text-sm text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-brand-800/50">No inquiries yet.</p>
          ) : (
            <div className="divide-y divide-brand-100">
              {recentLeads.map((l) => (
                <div key={l.id} className="py-2.5 text-sm">
                  <div className="font-medium text-brand-900">{l.businessName}</div>
                  <div className="text-brand-800/60">
                    {l.contactName} · {l.email}
                    {l.location ? ` · ${l.location}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {stats.pendingFulfil > 0 && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Truck className="h-4 w-4" />
          You have {stats.pendingFulfil} paid{" "}
          {stats.pendingFulfil === 1 ? "order" : "orders"} awaiting fulfillment.{" "}
          <Link href="/admin/orders" className="font-medium underline">
            Review orders
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const body = (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-brand-800/50">
        <span className="text-saddle">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-bold text-brand-900">{value}</div>
      {sub && <div className="text-xs text-brand-800/50">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
