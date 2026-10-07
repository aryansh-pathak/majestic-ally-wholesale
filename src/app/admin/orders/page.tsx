import { listAllOrders } from "@/lib/admin";
import { formatCents } from "@/lib/utils";
import { OrderStatusSelect } from "./order-status-select";
import { OrderDelete } from "./order-actions";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await listAllOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-900">Orders</h1>
      <p className="mt-1 text-sm text-brand-800/60">
        {orders.length} orders. Change status to track fulfillment.
      </p>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-800/60">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Retailer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-center">Discount</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-800/50">
                  No orders yet.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-brand-50/50">
                  <td className="px-4 py-3 font-medium text-brand-900">#{o.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-brand-900">{o.business}</div>
                    <div className="text-xs text-brand-800/50">{o.email}</div>
                  </td>
                  <td className="px-4 py-3 text-brand-800/70">
                    {new Date(o.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-center text-brand-800/70">
                    {o.discountPct}%
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-brand-900">
                    {formatCents(o.totalCents)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusSelect id={o.id} status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <OrderDelete id={o.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
