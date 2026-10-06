import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------
export const userRole = pgEnum("user_role", ["owner", "retailer"]);
export const userStatus = pgEnum("user_status", ["active", "disabled"]);
export const productStatus = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);
export const orderStatus = pgEnum("order_status", [
  "pending", // created, awaiting payment
  "paid", // Stripe confirmed
  "fulfilled", // shipped by owner
  "cancelled",
]);

// -----------------------------------------------------------------------------
// Users (owner + retailers). No public signup grants access — the owner
// provisions retailer accounts. Passwords are bcrypt-hashed.
// -----------------------------------------------------------------------------
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("retailer"),
    status: userStatus("status").notNull().default("active"),
    name: text("name"),
    businessName: text("business_name"),
    // Optional per-account discount override (percent off MSRP) that replaces
    // the standard tier logic for a specific retailer. Null = use tiers.
    accountDiscountPct: integer("account_discount_pct"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

// Password reset tokens (hashed). Single-use, short-lived.
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Optional TOTP 2FA secret for the owner account.
export const totpSecrets = pgTable("totp_secrets", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  secret: text("secret").notNull(),
  enabled: boolean("enabled").notNull().default(false),
});

// -----------------------------------------------------------------------------
// Catalog — products and their variants, synced from Shopify.
// Prices are stored as integer cents to avoid floating-point money bugs.
// -----------------------------------------------------------------------------
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    shopifyProductId: text("shopify_product_id").notNull(),
    title: text("title").notNull(),
    handle: text("handle"),
    description: text("description"),
    category: text("category"), // from Shopify productType
    vendor: text("vendor"),
    status: productStatus("status").notNull().default("active"),
    featuredImageUrl: text("featured_image_url"),
    // All product photos (array of URLs) for the gallery.
    images: jsonb("images"),
    // Owner can hide a product from the portal without deleting it.
    hidden: boolean("hidden").notNull().default(false),
    baseSku: text("base_sku"), // e.g. MA-0903, derived from variant SKUs
    totalInventory: integer("total_inventory").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    syncedAt: timestamp("synced_at", { withTimezone: true }),
  },
  (t) => ({
    shopifyIdx: uniqueIndex("products_shopify_id_idx").on(t.shopifyProductId),
    categoryIdx: index("products_category_idx").on(t.category),
  })
);

export const variants = pgTable(
  "variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    shopifyVariantId: text("shopify_variant_id").notNull(),
    sku: text("sku"),
    title: text("title"), // e.g. "Black" or "Medium / Red"
    retailCents: integer("retail_cents").notNull().default(0),
    // Per-SKU wholesale override (absolute price in cents). Null = use tier %.
    wholesaleOverrideCents: integer("wholesale_override_cents"),
    inventoryQuantity: integer("inventory_quantity").notNull().default(0),
    imageUrl: text("image_url"),
    position: integer("position").notNull().default(0),
  },
  (t) => ({
    shopifyIdx: uniqueIndex("variants_shopify_id_idx").on(t.shopifyVariantId),
    skuIdx: index("variants_sku_idx").on(t.sku),
    productIdx: index("variants_product_idx").on(t.productId),
  })
);

// -----------------------------------------------------------------------------
// Retailer interest leads (public "Become a Retailer" form).
// -----------------------------------------------------------------------------
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  website: text("website"),
  businessType: text("business_type"),
  location: text("location"),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// -----------------------------------------------------------------------------
// Orders — placed by logged-in retailers, paid via Stripe.
// -----------------------------------------------------------------------------
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    status: orderStatus("status").notNull().default("pending"),
    subtotalCents: integer("subtotal_cents").notNull().default(0), // wholesale subtotal
    msrpSubtotalCents: integer("msrp_subtotal_cents").notNull().default(0),
    discountPct: integer("discount_pct").notNull().default(0),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    customerNote: text("customer_note"),
    shippingAddress: jsonb("shipping_address"),
    stripeSessionId: text("stripe_session_id"),
    stripePaymentIntent: text("stripe_payment_intent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("orders_user_idx").on(t.userId),
    sessionIdx: index("orders_session_idx").on(t.stripeSessionId),
  })
);

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id"),
  sku: text("sku"),
  productTitle: text("product_title").notNull(),
  variantTitle: text("variant_title"),
  unitRetailCents: integer("unit_retail_cents").notNull().default(0),
  unitWholesaleCents: integer("unit_wholesale_cents").notNull().default(0),
  quantity: integer("quantity").notNull().default(1),
  lineTotalCents: integer("line_total_cents").notNull().default(0),
});

// -----------------------------------------------------------------------------
// Settings — a single editable row (id = 1) the owner controls from admin.
// Holds brand copy, the notification email, tier config, etc. Editable without
// touching code.
// -----------------------------------------------------------------------------
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  // Email
  notificationEmail: text("notification_email")
    .notNull()
    .default("info@majesticallyproducts.com"),
  emailFrom: text("email_from"),
  // Brand copy (public site)
  heroHeadline: text("hero_headline"),
  heroSubtext: text("hero_subtext"),
  storyMarkdown: text("story_markdown"),
  whereWeSell: jsonb("where_we_sell"), // string[]
  // Commerce
  freeShipThresholdCents: integer("free_ship_threshold_cents")
    .notNull()
    .default(15000),
  flatShippingCents: integer("flat_shipping_cents").notNull().default(1500),
  // Pricing tiers: [{ minCents, pct }]
  tiers: jsonb("tiers"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
