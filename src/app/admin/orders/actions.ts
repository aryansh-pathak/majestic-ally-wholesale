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
