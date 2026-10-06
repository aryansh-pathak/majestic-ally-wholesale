import "server-only";
import { cookies } from "next/headers";
import { inArray, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { auth } from "@/auth";
import { getSettings } from "./settings";
import { computeCart, unitWholesaleCents, type CartTotals } from "./pricing";

const COOKIE = "ma_cart";

export type RawCartItem = { v: number; q: number };

export type CartLine = {
  variantId: number;
  productId: number;
  productTitle: string;
  productHandle: string | null;
  variantTitle: string | null;
  sku: string | null;
  image: string | null;
  retailCents: number;
  overrideCents: number | null;
  quantity: number;
  inventoryQuantity: number;
  unitWholesaleCents: number;
  lineTotalCents: number;
};

export type CartView = {
  lines: CartLine[];
  totals: CartTotals;
  count: number;
};

export async function readRawCart(): Promise<RawCartItem[]> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((i) => typeof i?.v === "number" && typeof i?.q === "number")
      .map((i) => ({ v: i.v, q: Math.max(0, Math.min(999, Math.floor(i.q))) }))
      .filter((i) => i.q > 0);
  } catch {
    return [];
  }
}

export async function writeRawCart(items: RawCartItem[]): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify(items), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function cartCount(): Promise<number> {
  const items = await readRawCart();
  return items.reduce((s, i) => s + i.q, 0);
}

/**
 * Build the full, priced cart. All money is computed here on the server from
 * live product data + the owner's tier settings — never trusted from the client.
 */
export async function getCart(): Promise<CartView> {
  const raw = await readRawCart();
  const settings = await getSettings();

  if (raw.length === 0) {
    return {
      lines: [],
      totals: computeCart([], {
        tiers: settings.tiers,
        freeShipThresholdCents: settings.freeShipThresholdCents,
        flatShippingCents: settings.flatShippingCents,
      }),
      count: 0,
    };
  }

  const db = await getDb();
  const ids = raw.map((i) => i.v);
  const variantRows = await db
    .select()
    .from(schema.variants)
    .where(inArray(schema.variants.id, ids));
  const productIds = [...new Set(variantRows.map((v) => v.productId))];
  const productRows = productIds.length
    ? await db
        .select()
        .from(schema.products)
        .where(inArray(schema.products.id, productIds))
    : [];
  const productById = new Map(productRows.map((p) => [p.id, p]));

  // Per-account discount override (if the owner set one for this retailer).
  const session = await auth();
  let accountDiscountPct: number | null = null;
  if (session?.user?.id) {
    const u = await db
      .select({ pct: schema.users.accountDiscountPct })
      .from(schema.users)
      .where(eq(schema.users.id, Number(session.user.id)))
      .limit(1);
    accountDiscountPct = u[0]?.pct ?? null;
  }

  const lineInputs = raw
    .map((item) => {
      const v = variantRows.find((row) => row.id === item.v);
      if (!v) return null;
      return {
        retailCents: v.retailCents,
        overrideCents: v.wholesaleOverrideCents,
        quantity: item.q,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const totals = computeCart(lineInputs, {
    tiers: settings.tiers,
    freeShipThresholdCents: settings.freeShipThresholdCents,
    flatShippingCents: settings.flatShippingCents,
    accountDiscountPct,
  });

  const lines: CartLine[] = raw
    .map((item) => {
      const v = variantRows.find((row) => row.id === item.v);
      if (!v) return null;
      const product = productById.get(v.productId);
      const unit = unitWholesaleCents(
        v.retailCents,
        totals.tierPct,
        v.wholesaleOverrideCents
      );
      return {
        variantId: v.id,
        productId: v.productId,
        productTitle: product?.title ?? "Product",
        productHandle: product?.handle ?? null,
        variantTitle: v.title,
        sku: v.sku,
        image: v.imageUrl ?? product?.featuredImageUrl ?? null,
        retailCents: v.retailCents,
        overrideCents: v.wholesaleOverrideCents,
        quantity: item.q,
        inventoryQuantity: v.inventoryQuantity,
        unitWholesaleCents: unit,
        lineTotalCents: unit * item.q,
      };
    })
    .filter((x): x is CartLine => x !== null);

  return { lines, totals, count: raw.reduce((s, i) => s + i.q, 0) };
}
