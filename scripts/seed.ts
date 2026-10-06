/**
 * Seed script.
 *
 * Creates the owner account, a demo retailer login, the settings row, and loads
 * sample products. Run:
 *   npm run db:seed-local   # into the local preview database (PGlite)
 *   npm run db:seed         # into DATABASE_URL (Neon/production)
 *
 * It is idempotent — safe to run more than once.
 */
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "../src/db";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/password";
import { DEFAULT_TIERS } from "../src/lib/pricing";

function toCents(price: string): number {
  return Math.round(parseFloat(price) * 100);
}

function baseSkuOf(sku: string | null | undefined): string | null {
  if (!sku) return null;
  const m = sku.match(/^([A-Za-z]+-\d+)/);
  return m ? m[1] : sku;
}

async function main() {
  const db = await getDb();

  // --- Settings row ---------------------------------------------------------
  const existingSettings = await db
    .select()
    .from(schema.settings)
    .where(eq(schema.settings.id, 1))
    .limit(1);
  if (!existingSettings[0]) {
    await db.insert(schema.settings).values({
      id: 1,
      notificationEmail:
        process.env.OWNER_EMAIL || "info@majesticallyproducts.com",
      emailFrom:
        process.env.EMAIL_FROM ||
        "Majestic Ally Wholesale <no-reply@majesticallyproducts.com>",
      heroHeadline:
        "Wholesale tack, grooming & western pet goods — built to last.",
      heroSubtext:
        "Majestic Ally supplies retailers and resellers with 140+ styles of equestrian gear and hand-tooled pet accessories. Log in to see your wholesale pricing.",
      storyMarkdown:
        "**[Placeholder — your brand story goes here.]** Tell retailers who Majestic Ally is, what you make, and why buyers trust your line. Edit this any time from Admin → Settings.",
      whereWeSell: [
        "Amazon",
        "Walmart Marketplace",
        "Etsy",
        "eBay",
        "Chewy",
        "Faire",
      ],
      freeShipThresholdCents: 15000,
      flatShippingCents: 1500,
      tiers: DEFAULT_TIERS,
    });
    console.log("✓ settings row created");
  } else {
    console.log("• settings row already exists");
  }

  // --- Owner account --------------------------------------------------------
  const ownerEmail = (
    process.env.OWNER_EMAIL || "info@majesticallyproducts.com"
  )
    .toLowerCase()
    .trim();
  const ownerPassword = process.env.OWNER_PASSWORD || "ChangeMe!2026";
  const ownerHash = await hashPassword(ownerPassword);

  const existingOwner = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, ownerEmail))
    .limit(1);
  if (!existingOwner[0]) {
    await db.insert(schema.users).values({
      email: ownerEmail,
      passwordHash: ownerHash,
      role: "owner",
      status: "active",
      name: "Majestic Ally Owner",
      businessName: "Majestic Ally",
    });
    console.log(`✓ owner account created: ${ownerEmail} / ${ownerPassword}`);
    console.log("  ⚠ change this password after first login");
  } else {
    console.log(`• owner account already exists: ${ownerEmail}`);
  }

  // --- Demo retailer account (for testing the gated catalog) ---------------
  const demoEmail = "retailer@example.com";
  const demoPassword = "Retailer!2026";
  const existingDemo = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, demoEmail))
    .limit(1);
  if (!existingDemo[0]) {
    await db.insert(schema.users).values({
      email: demoEmail,
      passwordHash: await hashPassword(demoPassword),
      role: "retailer",
      status: "active",
      name: "Jordan Blake",
      businessName: "Prairie Tack Co.",
    });
    console.log(`✓ demo retailer created: ${demoEmail} / ${demoPassword}`);
  } else {
    console.log(`• demo retailer already exists: ${demoEmail}`);
  }

  // --- Products -------------------------------------------------------------
  const fixturePath = path.join(process.cwd(), "data", "sample-products.json");
  if (!fs.existsSync(fixturePath)) {
    console.log("• no sample-products.json — skipping product seed");
    return;
  }
  const items = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as Array<{
    id: string;
    title: string;
    handle: string;
    category: string;
    description: string;
    image: string;
    images?: string[];
    variants: Array<{
      id: string;
      sku: string;
      title: string;
      price: string;
      inv: number;
    }>;
  }>;

  let productCount = 0;
  let variantCount = 0;
  for (const p of items) {
    const totalInventory = p.variants.reduce((s, v) => s + (v.inv || 0), 0);
    const base = baseSkuOf(p.variants[0]?.sku);

    // Upsert product by Shopify id.
    const existing = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.shopifyProductId, p.id))
      .limit(1);

    let productId: number;
    if (existing[0]) {
      productId = existing[0].id;
      await db
        .update(schema.products)
        .set({
          title: p.title,
          handle: p.handle,
          description: p.description,
          category: p.category,
          vendor: "Majestic Ally",
          featuredImageUrl: p.image,
          images: p.images ?? (p.image ? [p.image] : []),
          baseSku: base,
          totalInventory,
          status: "active",
          syncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, productId));
    } else {
      const inserted = await db
        .insert(schema.products)
        .values({
          shopifyProductId: p.id,
          title: p.title,
          handle: p.handle,
          description: p.description,
          category: p.category,
          vendor: "Majestic Ally",
          status: "active",
          featuredImageUrl: p.image,
          images: p.images ?? (p.image ? [p.image] : []),
          baseSku: base,
          totalInventory,
          syncedAt: new Date(),
        })
        .returning({ id: schema.products.id });
      productId = inserted[0].id;
    }
    productCount++;

    // Replace variants for a clean re-seed.
    await db
      .delete(schema.variants)
      .where(eq(schema.variants.productId, productId));
    let pos = 0;
    for (const v of p.variants) {
      await db.insert(schema.variants).values({
        productId,
        shopifyVariantId: v.id,
        sku: v.sku,
        title: v.title,
        retailCents: toCents(v.price),
        inventoryQuantity: v.inv,
        imageUrl: p.image,
        position: pos++,
      });
      variantCount++;
    }
  }
  console.log(`✓ seeded ${productCount} products, ${variantCount} variants`);
  console.log("\nDone.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
