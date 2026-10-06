import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { getStripe } from "@/lib/stripe";
import {
  getOrderWithItems,
  markOrderPaid,
  sendOrderEmails,
} from "@/lib/orders";
import { formatCents } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order?: string; demo?: string }>;
}) {
  const session = await requireUser();
  const sp = await searchParams;

  let orderId: number | null = null;

  if (sp.order) {
    orderId = Number(sp.order);
  } else if (sp.session_id) {
    // Real Stripe return. Resolve the order and finalize as a fallback in case
    // the webhook hasn't landed yet (or isn't configured).
    const stripe = getStripe();
    if (stripe) {
      try {
        const s = await stripe.checkout.sessions.retrieve(sp.session_id);
        orderId = Number(s.metadata?.orderId) || null;
        if (orderId && s.payment_status === "paid") {
          const existing = await getOrderWithItems(orderId);
          if (existing && existing.order.status === "pending") {
            await markOrderPaid(orderId, {
              sessionId: s.id,
              paymentIntent:
                typeof s.payment_intent === "string" ? s.payment_intent : undefined,
              shippingAddress: s.customer_details ?? null,
            });
            await sendOrderEmails(orderId);
          }
        }
      } catch (err) {
        console.error("[success] stripe lookup failed:", err);
      }
    }
  }

  if (!orderId) redirect("/catalog");

  const data = await getOrderWithItems(orderId);
  // Only let the buyer see their own order.
  if (!data || data.order.userId !== Number(session.user.id)) redirect("/catalog");
  const { order, items } = data;

  return (
    <>
      <ClearCartOnMount />
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={0}
        showSearch={false}
      />
      <main className="container-page max-w-2xl py-12">
        <div className="card p-8 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-brand-500" />
          <h1 className="mt-4 text-2xl font-semibold text-brand-900">
            Order #{order.id} confirmed
          </h1>
          <p className="mt-2 text-brand-800/70">
            Thanks{session.user.businessName ? `, ${session.user.businessName}` : ""}!
            A confirmation is on its way to your email. We&apos;ll notify you when
            it ships.
          </p>
        </div>

        <div className="card mt-6 p-6">
          <h2 className="mb-3 font-semibold text-brand-900">Order summary</h2>
          <div className="divide-y divide-brand-100">
            {items.map((it) => (
              <div
                key={it.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-brand-900">
                    {it.productTitle}
                  </div>
                  <div className="text-xs text-brand-800/50">
                    {it.variantTitle} ·{" "}
                    <span className="font-mono text-saddle-dark">{it.sku}</span> ·
                    Qty {it.quantity}
                  </div>
                </div>
                <div className="font-semibold text-brand-900">
                  {formatCents(it.lineTotalCents)}
                </div>
              </div>
            ))}
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-brand-800/70">Wholesale ({order.discountPct}% off)</dt>
              <dd>{formatCents(order.subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-brand-800/70">Shipping</dt>
              <dd>{order.shippingCents === 0 ? "Free" : formatCents(order.shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-brand-100 pt-2 text-base font-bold text-brand-900">
              <dt>Total</dt>
              <dd>{formatCents(order.totalCents)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/catalog" className="btn-primary">
            Continue shopping
          </Link>
          <Link href="/account" className="btn-outline">
            View my orders
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
