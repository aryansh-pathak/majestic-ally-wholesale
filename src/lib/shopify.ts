import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { categorize } from "./categorize";

/**
 * Shopify Admin API sync.
 *
 * Pulls products, variants, prices, images and inventory from the store via the
 * Admin GraphQL API and upserts them into our catalog. Runs on demand (the
 * "Refresh from Shopify" button in admin) and on the nightly cron.
 *
 * Requires SHOPIFY_STORE_DOMAIN (e.g. your-store.myshopify.com) and
 * SHOPIFY_ADMIN_TOKEN (Admin API access token from a custom app).
 */

const API_VERSION = "2025-01";

type ShopifyVariant = {
  id: string;
  sku: string | null;
  title: string;
  price: string;
  inventoryQuantity: number | null;
  image: { url: string } | null;
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  descriptionHtml: string | null;
  productType: string | null;
  vendor: string | null;
  status: string;
  featuredImage: { url: string } | null;
  images: { edges: { node: { url: string } }[] };
  totalInventory: number | null;
  variants: { edges: { node: ShopifyVariant }[] };
};

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 40, after: $cursor, sortKey: INVENTORY_TOTAL, reverse: true) {
      edges {
        node {
          id
          title
          handle
          descriptionHtml
          productType
          vendor
          status
          featuredImage { url }
          images(first: 12) { edges { node { url } } }
          totalInventory
          variants(first: 100) {
            edges { node { id sku title price inventoryQuantity image { url } } }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function numericId(gid: string): string {
  const m = gid.match(/(\d+)(?!.*\d)/);
  return m ? m[1] : gid;
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 2000);
}

function baseSkuOf(sku: string | null): string | null {
  if (!sku) return null;
  const m = sku.match(/^([A-Za-z]+-\d+)/);
  return m ? m[1] : sku;
}

async function shopifyGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) {
    throw new Error("Shopify is not configured (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN).");
  }
  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Shopify API error ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
  }
  return json.data as T;
}

export function isShopifyConfigured(): boolean {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN);
}

export type SyncResult = { products: number; variants: number; errors: string[] };

export async function syncFromShopify(): Promise<SyncResult> {
  const db = await getDb();
  const result: SyncResult = { products: 0, variants: 0, errors: [] };

  let cursor: string | null = null;
  let hasNext = true;

  while (hasNext) {
    const data: {
      products: {
        edges: { node: ShopifyProduct }[];
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    } = await shopifyGraphQL(PRODUCTS_QUERY, { cursor });

    for (const edge of data.products.edges) {
      const p = edge.node;
      try {
        const shopifyProductId = numericId(p.id);
        const variants = p.variants.edges.map((e) => e.node);
        const base = baseSkuOf(variants[0]?.sku ?? null);
        const status =
          p.status === "ACTIVE" ? "active" : p.status === "DRAFT" ? "draft" : "archived";

        const existing = await db
          .select({ id: schema.products.id })
          .from(schema.products)
          .where(eq(schema.products.shopifyProductId, shopifyProductId))
          .limit(1);

        let productId: number;
        const values = {
          title: p.title,
          handle: p.handle,
          description: stripHtml(p.descriptionHtml),
          category: categorize(p.title, p.productType),
          vendor: p.vendor || "Majestic Ally",
          status: status as "active" | "draft" | "archived",
          featuredImageUrl: p.featuredImage?.url ?? null,
          images: (() => {
            const urls = p.images.edges.map((e) => e.node.url);
            const feat = p.featuredImage?.url;
            const all = feat && !urls.includes(feat) ? [feat, ...urls] : urls;
            return [...new Set(all)].slice(0, 12);
          })(),
          baseSku: base,
          totalInventory: p.totalInventory ?? 0,
          syncedAt: new Date(),
          updatedAt: new Date(),
        };

        if (existing[0]) {
          productId = existing[0].id;
          await db.update(schema.products).set(values).where(eq(schema.products.id, productId));
        } else {
          const ins = await db
            .insert(schema.products)
            .values({ shopifyProductId, ...values })
            .returning({ id: schema.products.id });
          productId = ins[0].id;
        }

        // Upsert variants; keep owner price overrides intact.
        let pos = 0;
        for (const v of variants) {
          const vId = numericId(v.id);
          const retailCents = Math.round(parseFloat(v.price || "0") * 100);
          const existingV = await db
            .select({ id: schema.variants.id })
            .from(schema.variants)
            .where(eq(schema.variants.shopifyVariantId, vId))
            .limit(1);
          const vValues = {
            productId,
            sku: v.sku,
            title: v.title,
            retailCents,
            inventoryQuantity: v.inventoryQuantity ?? 0,
            imageUrl: v.image?.url ?? p.featuredImage?.url ?? null,
            position: pos++,
          };
          if (existingV[0]) {
            // Note: we do NOT touch wholesaleOverrideCents so owner overrides survive.
            await db.update(schema.variants).set(vValues).where(eq(schema.variants.id, existingV[0].id));
          } else {
            await db.insert(schema.variants).values({ shopifyVariantId: vId, ...vValues });
          }
          result.variants++;
        }
        result.products++;
      } catch (err) {
        result.errors.push(`${p.title}: ${String(err)}`);
      }
    }

    hasNext = data.products.pageInfo.hasNextPage;
    cursor = data.products.pageInfo.endCursor;
  }

  return result;
}
