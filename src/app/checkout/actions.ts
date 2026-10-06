"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { getCart, writeRawCart } from "@/lib/cart";
import { getStripe } from "@/lib/stripe";
import {
  createOrderFromCart,
  markOrderPaid,
  sendOrderEmails,
} from "@/lib/orders";
import type Stripe from "stripe";

function baseUrl() {
  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/**
 * Begin checkout. Recomputes the cart server-side, creates a pending order,
 * then either sends the buyer to Stripe Checkout (production) or completes a
 * demo order (when Stripe isn't configured, e.g. local preview).
 */
export async function startCheckout(): Promise<{ error?: string }> {
  const session = await requireUser();
  const userId = Number(session.user.id);

  const cart = await getCart();
  if (cart.lines.length === 0) return { error: "Your cart is empty." };

  const created = await createOrderFromCart(userId);
  if (!created) return { error: "Could not create your order." };

  const stripe = getStripe();

  // ---- Demo mode (no Stripe keys): mark paid, email, clear cart ----
  if (!stripe) {
    await markOrderPaid(created.orderId, { sessionId: "demo" });
    await sendOrderEmails(created.orderId);
    await writeRawCart([]);
    redirect(`/checkout/success?order=${created.orderId}&demo=1`);
  }

  // ---- Real Stripe Checkout ----
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.lines.map(
    (line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "usd",
        unit_amount: line.unitWholesaleCents,
        product_data: {
          name: line.productTitle,
          description: [line.variantTitle, line.sku].filter(Boolean).join(" · "),
        },
      },
    })
  );

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: session.user.email ?? undefined,
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: cart.totals.shippingCents, currency: "usd" },
          display_name:
            cart.totals.shippingCents === 0 ? "Free shipping" : "Standard shipping",
        },
      },
    ],
    metadata: { orderId: String(created.orderId) },
    success_url: `${baseUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl()}/cart`,
  });

  if (!checkout.url) return { error: "Could not start checkout. Please try again." };
  redirect(checkout.url);
}
