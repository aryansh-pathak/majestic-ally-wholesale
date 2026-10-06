import Link from "next/link";
import { ShoppingCart, ArrowRight, TicketPercent, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { CartLineRow } from "@/components/cart-line-row";
import { getCart } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Cart",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const session = await requireUser();
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);
  const { lines, totals } = cart;

  return (
    <>
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={cart.count}
      />
      <main className="container-page py-8">
        <h1 className="mb-6 text-2xl font-semibold text-brand-900">Your order</h1>

        {lines.length === 0 ? (
          <div className="card flex flex-col items-center gap-4 p-12 text-center">
            <ShoppingCart className="h-10 w-10 text-brand-300" />
            <p className="text-brand-800/70">Your cart is empty.</p>
            <Link href="/catalog" className="btn-primary">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Lines */}
            <div className="card divide-y divide-brand-100 px-5">
              {lines.map((line) => (
                <CartLineRow key={line.variantId} line={line} />
              ))}
            </div>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-brand-900">
                  Order summary
                </h2>

                {/* Wholesale discount banner */}
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm font-medium text-brand-800">
                  <TicketPercent className="h-4 w-4 text-saddle" />
                  <span>Your {totals.tierPct}% wholesale discount is applied.</span>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="MSRP subtotal">
                    <span className="text-brand-800/60 line-through">
                      {formatCents(totals.msrpSubtotalCents)}
                    </span>
                  </Row>
                  <Row label={`Wholesale (${totals.tierPct}% off)`}>
                    {formatCents(totals.wholesaleSubtotalCents)}
                  </Row>
                  <Row label="You save">
                    <span className="text-brand-600">
                      −{formatCents(totals.discountCents)}
                    </span>
                  </Row>
                  <Row label="Shipping">
                    {totals.freeShipping ? (
                      <span className="text-brand-600">Free</span>
                    ) : (
                      formatCents(totals.shippingCents)
                    )}
                  </Row>
                  <div className="border-t border-brand-100 pt-2">
                    <Row label="Total" bold>
                      {formatCents(totals.totalCents)}
                    </Row>
                  </div>
                </dl>

                {!totals.freeShipping && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-800/60">
                    <Truck className="h-3.5 w-3.5" />
                    Free shipping at{" "}
                    {formatCents(settings.freeShipThresholdCents)}.
                  </p>
                )}

                <Link href="/checkout" className="btn-primary mt-5 w-full">
                  Proceed to checkout <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/catalog"
                  className="btn-ghost mt-2 w-full text-sm"
                >
                  Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function Row({
  label,
  children,
  bold,
}: {
  label: string;
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? "font-semibold text-brand-900" : "text-brand-800/70"}>
        {label}
      </dt>
      <dd className={bold ? "text-base font-bold text-brand-900" : "font-medium"}>
        {children}
      </dd>
    </div>
  );
}
