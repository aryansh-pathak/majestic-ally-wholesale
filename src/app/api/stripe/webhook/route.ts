import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markOrderPaid, sendOrderEmails, getOrderWithItems } from "@/lib/orders";

// Stripe posts events here. We verify the signature, then mark the order paid.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "not configured" }, { status: 400 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("[stripe] signature verification failed:", err);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = Number(session.metadata?.orderId);
    if (orderId) {
      // Idempotency: skip if already paid.
      const existing = await getOrderWithItems(orderId);
      if (existing && existing.order.status === "pending") {
        await markOrderPaid(orderId, {
          sessionId: session.id,
          paymentIntent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : undefined,
          shippingAddress: session.customer_details ?? null,
        });
        await sendOrderEmails(orderId);
      }
    }
  }

  return NextResponse.json({ received: true });
}
