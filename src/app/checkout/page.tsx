import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock, Truck } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { getCart } from "@/lib/cart";
import { getSettings } from "@/lib/settings";
import { isStripeConfigured } from "@/lib/stripe";
import { formatCents } from "@/lib/utils";
import { CheckoutButton } from "./checkout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const session = await requireUser();
  const [cart, settings] = await Promise.all([getCart(), getSettings()]);
  if (cart.lines.length === 0) redirect("/cart");

  const demo = !isStripeConfigured();
  const t = cart.totals;

  return (
    <>
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={cart.count}
        showSearch={false}
      />
      <main className="container-page py-8">
        <h1 className="mb-6 text-2xl font-semibold text-brand-900">Checkout</h1>

        {demo && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Demo mode:</strong> Stripe isn&apos;t connected in this
            preview, so no real payment is taken — placing the order simulates a
            successful checkout so you can see the full flow. In production this
            button sends the buyer to Stripe&apos;s secure card page.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Review */}
          <div className="card divide-y divide-brand-100">
            <div className="px-6 py-4">
              <h2 className="font-semibold text-brand-900">
                Review your order ({cart.count} items)
              </h2>
            </div>
            {cart.lines.map((line) => (
              <div
                key={line.variantId}
                className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-brand-900">
                    {line.productTitle}
                  </div>
                  <div className="text-xs text-brand-800/50">
                    {line.variantTitle} ·{" "}
                    <span className="font-mono text-saddle-dark">{line.sku}</span>{" "}
                    · Qty {line.quantity}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-semibold text-brand-900">
                    {formatCents(line.lineTotalCents)}
                  </div>
                  <div className="text-xs text-brand-800/50">
                    {formatCents(line.unitWholesaleCents)} ea
                  </div>
                </div>
              </div>
            ))}
            <div className="px-6 py-3 text-xs text-brand-800/60">
              <Truck className="mr-1 inline h-3.5 w-3.5" />
              {demo
                ? "Shipping address is collected at the (simulated) payment step."
                : "You'll enter your shipping address on the next (secure Stripe) step."}
            </div>
          </div>

          {/* Summary + pay */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-6">
              <dl className="space-y-2 text-sm">
                <Row label="MSRP subtotal">
                  <span className="text-brand-800/60 line-through">
                    {formatCents(t.msrpSubtotalCents)}
                  </span>
                </Row>
                <Row label={`Wholesale (${t.tierPct}% off)`}>
                  {formatCents(t.wholesaleSubtotalCents)}
                </Row>
                <Row label="You save">
                  <span className="text-brand-600">
                    −{formatCents(t.discountCents)}
                  </span>
                </Row>
                <Row label="Shipping">
                  {t.freeShipping ? (
                    <span className="text-brand-600">Free</span>
                  ) : (
                    formatCents(t.shippingCents)
                  )}
                </Row>
                <div className="border-t border-brand-100 pt-2">
                  <Row label="Total" bold>
                    {formatCents(t.totalCents)}
                  </Row>
                </div>
              </dl>

              <div className="mt-5">
                <CheckoutButton demo={demo} />
              </div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-brand-800/50">
                <Lock className="h-3 w-3" />
                {demo ? "Simulated — no card charged" : "Secured by Stripe"}
              </p>
              <Link href="/cart" className="btn-ghost mt-2 w-full text-sm">
                Back to cart
              </Link>
            </div>
          </aside>
        </div>
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
