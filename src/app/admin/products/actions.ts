"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireOwner } from "@/lib/auth-helpers";
import { toCents } from "@/lib/utils";

function dollarsToCentsOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = parseFloat(s);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}

const productSchema = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(400),
  category: z.string().max(120).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  status: z.enum(["active", "draft", "archived"]),
  hidden: z.union([z.literal("on"), z.null()]).optional(),
  featuredImageUrl: z.string().max(1000).optional().or(z.literal("")),
});

/** Save product fields + per-variant retail price and wholesale override. */
export async function saveProduct(formData: FormData) {
  await requireOwner();
  const parsed = productSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    status: formData.get("status"),
    hidden: formData.get("hidden"),
    featuredImageUrl: formData.get("featuredImageUrl"),
  });
  if (!parsed.success) return { ok: false, error: "Please check the product fields." };
  const d = parsed.data;

  const db = await getDb();
  await db
    .update(schema.products)
    .set({
      title: d.title,
      category: d.category || null,
      description: d.description || null,
      status: d.status,
      hidden: formData.get("hidden") === "on",
      featuredImageUrl: d.featuredImageUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.products.id, d.id));

  // Variants: fields named retail_<vid> and override_<vid>
  const variants = await db
    .select({ id: schema.variants.id })
    .from(schema.variants)
    .where(eq(schema.variants.productId, d.id));
  for (const v of variants) {
    const retail = dollarsToCentsOrNull(formData.get(`retail_${v.id}`));
    const override = dollarsToCentsOrNull(formData.get(`override_${v.id}`));
    const set: Record<string, unknown> = { wholesaleOverrideCents: override };
    if (retail != null) set.retailCents = retail;
    await db.update(schema.variants).set(set).where(eq(schema.variants.id, v.id));
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${d.id}`);
  revalidatePath("/catalog");
  return { ok: true };
}

export async function setProductHidden(id: number, hidden: boolean) {
  await requireOwner();
  const db = await getDb();
  await db.update(schema.products).set({ hidden }).where(eq(schema.products.id, id));
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { ok: true };
}

export async function deleteProduct(id: number) {
  await requireOwner();
  const db = await getDb();
  await db.delete(schema.products).where(eq(schema.products.id, id)); // cascades to variants
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  return { ok: true };
}

const createSchema = z.object({
  title: z.string().min(1).max(400),
  sku: z.string().min(1).max(60),
  category: z.string().max(120).optional().or(z.literal("")),
  retail: z.string().min(1),
  image: z.string().max(1000).optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
});

/** Create a product manually (not from Shopify). */
export async function createProduct(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireOwner();
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "Fill in title, SKU and price." };
  const d = parsed.data;
  const db = await getDb();

  const handle = d.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const localId = `local-${Date.now()}`;

  const ins = await db
    .insert(schema.products)
    .values({
      shopifyProductId: localId,
      title: d.title,
      handle: `${handle}-${Date.now().toString().slice(-4)}`,
      description: d.description || null,
      category: d.category || "Other",
      vendor: "Majestic Ally",
      status: "active",
      featuredImageUrl: d.image || null,
      baseSku: d.sku,
      totalInventory: 0,
    })
    .returning({ id: schema.products.id });
  const productId = ins[0].id;

  await db.insert(schema.variants).values({
    productId,
    shopifyVariantId: `${localId}-v1`,
    sku: d.sku,
    title: "Default",
    retailCents: toCents(d.retail),
    inventoryQuantity: 0,
    imageUrl: d.image || null,
    position: 0,
  });

  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  redirect(`/admin/products/${productId}`);
}
