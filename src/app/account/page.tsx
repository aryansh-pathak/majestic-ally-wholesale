import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { listOrdersForUser } from "@/lib/orders";
import { cartCount } from "@/lib/cart";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-brand-100 text-brand-700",
  fulfilled: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AccountPage() {
  const session = await requireUser();
  const [orders, count] = await Promise.all([
    listOrdersForUser(Number(session.user.id)),
    cartCount(),
  ]);

  return (
    <>
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={count}
        showSearch={false}
      />
      <main className="container-page max-w-3xl py-12">
        <h1 className="text-3xl font-semibold text-brand-900">My account</h1>

        <div className="card mt-6 divide-y divide-brand-100">
          <Row label="Business" value={session.user.businessName || "—"} />
          <Row label="Contact" value={session.user.name || "—"} />
          <Row label="Email" value={session.user.email || "—"} />
          <Row label="Account type" value={session.user.role} />
        </div>

        <h2 className="mt-10 text-xl font-semibold text-brand-900">
          Order history
        </h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-brand-800/60">
            You haven&apos;t placed any orders yet.
          </p>
        ) : (
          <div className="card mt-3 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-800/60">
                <tr>
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium text-brand-900">
                      #{o.id}
                    </td>
                    <td className="px-4 py-3 text-brand-800/70">
                      {new Date(o.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge capitalize ${
                          STATUS_STYLES[o.status] || "bg-brand-100 text-brand-700"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand-900">
                      {formatCents(o.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-6 text-sm text-brand-800/60">
          Need to update your details? Email{" "}
          <a
            className="font-medium text-brand-700 underline"
            href="mailto:info@majesticallyproducts.com"
          >
            info@majesticallyproducts.com
          </a>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm font-medium text-brand-800/70">{label}</span>
      <span className="text-sm font-semibold capitalize text-brand-900">
        {value}
      </span>
    </div>
  );
}
