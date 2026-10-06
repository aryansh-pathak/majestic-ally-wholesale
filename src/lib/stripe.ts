import "server-only";
import Stripe from "stripe";

/**
 * Stripe client. Returns null when STRIPE_SECRET_KEY isn't configured, which
 * lets the app run in a "demo checkout" mode locally (no real payment) while
 * production uses real Stripe Checkout.
 */
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}
