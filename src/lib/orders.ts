import "server-only";
import { eq, desc } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { getCart } from "./cart";
import { getSettings } from "./settings";
import { sendMail, emailLayout } from "./email";
import { formatCents } from "./utils";

export type CreatedOrder = {
  orderId: number;
  totalCents: number;
  itemCount: number;
};

/** Create a pending order from the current cart (prices recomputed server-side). */
export async function createOrderFromCart(userId: number): Promise<CreatedOrder | null> {
  const cart = await getCart();
  if (cart.lines.length === 0) return null;

  const db = await getDb();
  const inserted = await db
    .insert(schema.orders)
    .values({
      userId,
      status: "pending",
      subtotalCents: cart.totals.wholesaleSubtotalCents,
      msrpSubtotalCents: cart.totals.msrpSubtotalCents,
      discountPct: cart.totals.tierPct,
      discountCents: cart.totals.discountCents,
      shippingCents: cart.totals.shippingCents,
      totalCents: cart.totals.totalCents,
    })
    .returning({ id: schema.orders.id });

  const orderId = inserted[0].id;

  for (const line of cart.lines) {
    await db.insert(schema.orderItems).values({
      orderId,
      variantId: line.variantId,
      sku: line.sku,
      productTitle: line.productTitle,
      variantTitle: line.variantTitle,
      unitRetailCents: line.retailCents,
      unitWholesaleCents: line.unitWholesaleCents,
      quantity: line.quantity,
      lineTotalCents: line.lineTotalCents,
    });
  }

  return {
    orderId,
    totalCents: cart.totals.totalCents,
    itemCount: cart.lines.reduce((s, l) => s + l.quantity, 0),
  };
}

export async function markOrderPaid(
  orderId: number,
  opts: { paymentIntent?: string; sessionId?: string; shippingAddress?: unknown } = {}
) {
  const db = await getDb();
  await db
    .update(schema.orders)
    .set({
      status: "paid",
      stripePaymentIntent: opts.paymentIntent ?? null,
      stripeSessionId: opts.sessionId ?? null,
      shippingAddress: opts.shippingAddress ?? null,
    })
    .where(eq(schema.orders.id, orderId));
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId))
    .limit(1);
  const order = rows[0];
  if (!order) return null;
  const items = await db
    .select()
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));
  return { order, items };
}

export async function listOrdersForUser(userId: number) {
  const db = await getDb();
  return db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));
}

/** Send the order confirmation to the retailer and a new-order alert to the owner. */
export async function sendOrderEmails(orderId: number) {
  const data = await getOrderWithItems(orderId);
  if (!data) return;
  const { order, items } = data;
  const settings = await getSettings();

  const db = await getDb();
  const users = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, order.userId))
    .limit(1);
  const user = users[0];

  const itemRows = items
    .map(
      (it) =>
        `<tr>
          <td style="padding:6px 12px 6px 0;">${escapeHtml(it.productTitle)}<br><span style="color:#7c5227;font-size:12px;">${escapeHtml(it.variantTitle || "")} · ${escapeHtml(it.sku || "")}</span></td>
          <td style="padding:6px;text-align:center;">${it.quantity}</td>
          <td style="padding:6px 0 6px 12px;text-align:right;">${formatCents(it.lineTotalCents)}</td>
        </tr>`
    )
    .join("");

  const totalsBlock = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
      <tr><td style="padding:3px 0;color:#555;">MSRP subtotal</td><td style="text-align:right;text-decoration:line-through;color:#999;">${formatCents(order.msrpSubtotalCents)}</td></tr>
      <tr><td style="padding:3px 0;color:#555;">Wholesale (${order.discountPct}% off)</td><td style="text-align:right;">${formatCents(order.subtotalCents)}</td></tr>
      <tr><td style="padding:3px 0;color:#1f7a4d;">You save</td><td style="text-align:right;color:#1f7a4d;">−${formatCents(order.discountCents)}</td></tr>
      <tr><td style="padding:3px 0;color:#555;">Shipping</td><td style="text-align:right;">${order.shippingCents === 0 ? "Free" : formatCents(order.shippingCents)}</td></tr>
      <tr><td style="padding:6px 0;font-weight:bold;border-top:1px solid #e6e0d5;">Total</td><td style="text-align:right;font-weight:bold;border-top:1px solid #e6e0d5;">${formatCents(order.totalCents)}</td></tr>
    </table>`;

  const itemTable = `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead><tr style="text-align:left;color:#7c5227;border-bottom:1px solid #e6e0d5;">
        <th style="padding:6px 0;">Item</th><th style="padding:6px;text-align:center;">Qty</th><th style="padding:6px 0;text-align:right;">Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>${totalsBlock}`;

  // To retailer
  if (user?.email) {
    await sendMail({
      to: user.email,
      from: settings.emailFrom,
      subject: `Your Majestic Ally order #${order.id} is confirmed`,
      html: emailLayout(
        `Thanks for your order, ${escapeHtml(user.businessName || user.name || "")}!`,
        `<p>We've received order <strong>#${order.id}</strong> and it's being prepared. Here's your summary:</p>${itemTable}<p style="margin-top:16px;color:#7c5227;">We'll email you tracking when it ships. Questions? Reply to this email.</p>`
      ),
    });
  }

  // To owner
  await sendMail({
    to: settings.notificationEmail,
    from: settings.emailFrom,
    replyTo: user?.email,
    subject: `New wholesale order #${order.id} — ${formatCents(order.totalCents)}`,
    html: emailLayout(
      `New order #${order.id}`,
      `<p><strong>${escapeHtml(user?.businessName || "A retailer")}</strong> (${escapeHtml(user?.email || "")}) just placed an order.</p>${itemTable}`
    ),
  });
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
