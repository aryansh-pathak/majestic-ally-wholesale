import "server-only";
import { and, or, eq, ilike, inArray, asc, desc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { numericLikePattern } from "./sku";

export type CatalogVariant = {
  id: number;
  sku: string | null;
  title: string | null;
  retailCents: number;
  wholesaleOverrideCents: number | null;
  inventoryQuantity: number;
  imageUrl: string | null;
};

export type CatalogProduct = {
  id: number;
  title: string;
  handle: string | null;
  description: string | null;
  category: string | null;
  baseSku: string | null;
  featuredImageUrl: string | null;
  images: string[];
  totalInventory: number;
  variants: CatalogVariant[];
  retailMinCents: number;
  retailMaxCents: number;
  hasOverride: boolean;
  inStock: boolean;
};

/** Product ids whose SKU matches a query (raw substring + numeric core). */
async function productIdsBySku(q: string): Promise<number[]> {
  const db = await getDb();
  const conditions = [ilike(schema.variants.sku, `%${q}%`)];
  const numeric = numericLikePattern(q);
  if (numeric) {
    // Match on digits of the SKU, ignoring the prefix and separators.
    conditions.push(
      sql`regexp_replace(${schema.variants.sku}, '[^0-9]', '', 'g') ILIKE ${numeric}`
    );
  }
  const rows = await db
    .selectDistinct({ productId: schema.variants.productId })
    .from(schema.variants)
    .where(or(...conditions));
  return rows.map((r) => r.productId);
}

function assemble(
  product: typeof schema.products.$inferSelect,
  variants: (typeof schema.variants.$inferSelect)[]
): CatalogProduct {
  const vs: CatalogVariant[] = variants
    .sort((a, b) => a.position - b.position)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      title: v.title,
      retailCents: v.retailCents,
      wholesaleOverrideCents: v.wholesaleOverrideCents,
      inventoryQuantity: v.inventoryQuantity,
      imageUrl: v.imageUrl,
    }));
  const prices = vs.map((v) => v.retailCents).filter((n) => n > 0);
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    category: product.category,
    baseSku: product.baseSku,
    featuredImageUrl: product.featuredImageUrl,
    images: (() => {
      const imgs = (product.images as string[] | null) ?? [];
      const list = imgs.length
        ? imgs
        : product.featuredImageUrl
          ? [product.featuredImageUrl]
          : [];
      return list;
    })(),
    totalInventory: product.totalInventory,
    variants: vs,
    retailMinCents: prices.length ? Math.min(...prices) : 0,
    retailMaxCents: prices.length ? Math.max(...prices) : 0,
    hasOverride: vs.some((v) => v.wholesaleOverrideCents != null),
    inStock: vs.some((v) => v.inventoryQuantity > 0),
  };
}

export type ListArgs = {
  q?: string;
  category?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "name";
};

/** List visible products for the catalog grid. */
export async function listProducts(args: ListArgs = {}): Promise<CatalogProduct[]> {
  const db = await getDb();
  const conds = [
    eq(schema.products.status, "active"),
    eq(schema.products.hidden, false),
  ];

  if (args.category) {
    conds.push(eq(schema.products.category, args.category));
  }

  if (args.q && args.q.trim()) {
    const q = args.q.trim();
    const skuIds = await productIdsBySku(q);
    const searchOr = skuIds.length
      ? or(ilike(schema.products.title, `%${q}%`), inArray(schema.products.id, skuIds))
      : ilike(schema.products.title, `%${q}%`);
    conds.push(searchOr!);
  }

  const orderBy =
    args.sort === "name"
      ? asc(schema.products.title)
      : desc(schema.products.totalInventory); // "featured" = best sellers first

  const products = await db
    .select()
    .from(schema.products)
    .where(and(...conds))
    .orderBy(orderBy);

  if (products.length === 0) return [];

  const ids = products.map((p) => p.id);
  const allVariants = await db
    .select()
    .from(schema.variants)
    .where(inArray(schema.variants.productId, ids));

  const byProduct = new Map<number, (typeof schema.variants.$inferSelect)[]>();
  for (const v of allVariants) {
    const arr = byProduct.get(v.productId) ?? [];
    arr.push(v);
    byProduct.set(v.productId, arr);
  }

  let result = products.map((p) => assemble(p, byProduct.get(p.id) ?? []));

  if (args.sort === "price-asc")
    result = result.sort((a, b) => a.retailMinCents - b.retailMinCents);
  if (args.sort === "price-desc")
    result = result.sort((a, b) => b.retailMinCents - a.retailMinCents);

  return result;
}

/** Distinct categories present in the visible catalog. */
export async function listCategories(): Promise<string[]> {
  const db = await getDb();
  const rows = await db
    .selectDistinct({ category: schema.products.category })
    .from(schema.products)
    .where(and(eq(schema.products.status, "active"), eq(schema.products.hidden, false)));
  return rows
    .map((r) => r.category)
    .filter((c): c is string => !!c)
    .sort();
}

export async function getProductByHandle(
  handle: string
): Promise<CatalogProduct | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.products)
    .where(and(eq(schema.products.handle, handle), eq(schema.products.hidden, false)))
    .limit(1);
  const product = rows[0];
  if (!product) return null;
  const variants = await db
    .select()
    .from(schema.variants)
    .where(eq(schema.variants.productId, product.id));
  return assemble(product, variants);
}

export type TypeaheadHit = {
  id: number;
  title: string;
  handle: string | null;
  baseSku: string | null;
  image: string | null;
  retailMinCents: number;
};

/** Lightweight results for the search dropdown. */
export async function typeahead(q: string, limit = 8): Promise<TypeaheadHit[]> {
  if (!q.trim()) return [];
  const products = await listProducts({ q });
  return products.slice(0, limit).map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    baseSku: p.baseSku,
    image: p.featuredImageUrl,
    retailMinCents: p.retailMinCents,
  }));
}
