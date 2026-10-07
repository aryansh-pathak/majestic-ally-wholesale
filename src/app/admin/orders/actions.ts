"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireOwner } from "@/lib/auth-helpers";

export async function setOrderStatus(
  id: number,
  status: "pending" | "paid" | "fulfilled" | "cancelled"
) {
  await requireOwner();
  const db = await getDb();
  await db.update(schema.orders).set({ status }).where(eq(schema.orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}

/** Permanently delete an order (its line items cascade). Cannot be undone. */
export async function deleteOrder(id: number): Promise<{ ok: boolean }> {
  await requireOwner();
  const db = await getDb();
  await db.delete(schema.orders).where(eq(schema.orders.id, id));
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  return { ok: true };
}
