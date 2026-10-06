import "server-only";
import { eq, desc, sql, and } from "drizzle-orm";
import { getDb, schema } from "@/db";

export async function getDashboardStats() {
  const db = await getDb();
  const [products] = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.products);
  const [visibleProducts] = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.products)
    .where(and(eq(schema.products.status, "active"), eq(schema.products.hidden, false)));
  const [retailers] = await db
    .select({ c: sql<number>`count(*)` })
    .from(schema.users)
    .where(eq(schema.users.role, "retailer"));
  const [leads] = await db.select({ c: sql<number>`count(*)` }).from(schema.leads);
  const orders = await db.select().from(schema.orders);
  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const revenueCents = paidOrders.reduce((s, o) => s + o.totalCents, 0);
  const pendingFulfil = orders.filter((o) => o.status === "paid").length;

  const [lastSync] = await db
    .select({ syncedAt: schema.products.syncedAt })
    .from(schema.products)
    .orderBy(desc(schema.products.syncedAt))
    .limit(1);

  return {
    products: Number(products?.c ?? 0),
    visibleProducts: Number(visibleProducts?.c ?? 0),
    retailers: Number(retailers?.c ?? 0),
    leads: Number(leads?.c ?? 0),
    orders: orders.length,
    paidOrders: paidOrders.length,
    pendingFulfil,
    revenueCents,
    lastSync: lastSync?.syncedAt ?? null,
  };
}

export async function listAllProducts() {
  const db = await getDb();
  const products = await db
    .select()
    .from(schema.products)
    .orderBy(desc(schema.products.totalInventory));
  const variants = await db.select().from(schema.variants);
  return products.map((p) => {
    const vs = variants.filter((v) => v.productId === p.id);
    const prices = vs.map((v) => v.retailCents).filter((n) => n > 0);
    return {
      ...p,
      variantCount: vs.length,
      retailMinCents: prices.length ? Math.min(...prices) : 0,
      hasOverride: vs.some((v) => v.wholesaleOverrideCents != null),
    };
  });
}

export async function getProductForEdit(id: number) {
  const db = await getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  if (!rows[0]) return null;
  const variants = await db
    .select()
    .from(schema.variants)
    .where(eq(schema.variants.productId, id))
    .orderBy(schema.variants.position);
  return { product: rows[0], variants };
}

export async function listRetailers() {
  const db = await getDb();
  return db
    .select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      businessName: schema.users.businessName,
      status: schema.users.status,
      accountDiscountPct: schema.users.accountDiscountPct,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .where(eq(schema.users.role, "retailer"))
    .orderBy(desc(schema.users.createdAt));
}

export async function listAllOrders() {
  const db = await getDb();
  const orders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
  const users = await db
    .select({ id: schema.users.id, businessName: schema.users.businessName, email: schema.users.email })
    .from(schema.users);
  return orders.map((o) => ({
    ...o,
    business: users.find((u) => u.id === o.userId)?.businessName ?? "—",
    email: users.find((u) => u.id === o.userId)?.email ?? "",
  }));
}

export async function listLeads() {
  const db = await getDb();
  return db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
}
