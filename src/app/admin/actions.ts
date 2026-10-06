"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth-helpers";
import { syncFromShopify, isShopifyConfigured } from "@/lib/shopify";

export async function refreshShopify(): Promise<{
  ok: boolean;
  message: string;
}> {
  await requireOwner();
  if (!isShopifyConfigured()) {
    return {
      ok: false,
      message:
        "Shopify isn't connected yet. Add SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN in your environment settings (see README).",
    };
  }
  try {
    const res = await syncFromShopify();
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    const errNote = res.errors.length ? ` (${res.errors.length} skipped)` : "";
    return {
      ok: true,
      message: `Synced ${res.products} products / ${res.variants} variants from Shopify${errNote}.`,
    };
  } catch (err) {
    return { ok: false, message: `Sync failed: ${String(err)}` };
  }
}
