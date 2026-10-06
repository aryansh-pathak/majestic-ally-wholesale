"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { readRawCart, writeRawCart } from "@/lib/cart";
import { requireUser } from "@/lib/auth-helpers";

/** Add (or increment) a variant in the cart. Retailer-only. */
export async function addToCart(variantId: number, quantity = 1) {
  await requireUser();
  const qty = Math.max(1, Math.min(999, Math.floor(quantity)));

  // Validate the variant exists and is orderable.
  const db = await getDb();
  const rows = await db
    .select({ id: schema.variants.id, inv: schema.variants.inventoryQuantity })
    .from(schema.variants)
    .where(eq(schema.variants.id, variantId))
    .limit(1);
  if (!rows[0]) return { ok: false, error: "Item not found." };

  const items = await readRawCart();
  const existing = items.find((i) => i.v === variantId);
  if (existing) existing.q = Math.min(999, existing.q + qty);
  else items.push({ v: variantId, q: qty });

  await writeRawCart(items);
  revalidatePath("/cart");
  const count = items.reduce((s, i) => s + i.q, 0);
  return { ok: true, count };
}

export async function updateCartItem(variantId: number, quantity: number) {
  await requireUser();
  const items = await readRawCart();
  const q = Math.max(0, Math.min(999, Math.floor(quantity)));
  const next = items
    .map((i) => (i.v === variantId ? { ...i, q } : i))
    .filter((i) => i.q > 0);
  await writeRawCart(next);
  revalidatePath("/cart");
  return { ok: true };
}

export async function removeCartItem(variantId: number) {
  await requireUser();
  const items = await readRawCart();
  await writeRawCart(items.filter((i) => i.v !== variantId));
  revalidatePath("/cart");
  return { ok: true };
}

export async function clearCart() {
  await requireUser();
  await writeRawCart([]);
  revalidatePath("/cart");
  return { ok: true };
}
