CREATE TYPE "public"."order_status" AS ENUM('pending', 'paid', 'fulfilled', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'retailer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"website" text,
	"business_type" text,
	"location" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"variant_id" integer,
	"sku" text,
	"product_title" text NOT NULL,
	"variant_title" text,
	"unit_retail_cents" integer DEFAULT 0 NOT NULL,
	"unit_wholesale_cents" integer DEFAULT 0 NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"line_total_cents" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"msrp_subtotal_cents" integer DEFAULT 0 NOT NULL,
	"discount_pct" integer DEFAULT 0 NOT NULL,
	"discount_cents" integer DEFAULT 0 NOT NULL,
	"shipping_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"customer_note" text,
	"shipping_address" jsonb,
	"stripe_session_id" text,
	"stripe_payment_intent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"shopify_product_id" text NOT NULL,
	"title" text NOT NULL,
	"handle" text,
	"description" text,
	"category" text,
	"vendor" text,
	"status" "product_status" DEFAULT 'active' NOT NULL,
	"featured_image_url" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"base_sku" text,
	"total_inventory" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"notification_email" text DEFAULT 'info@majesticallyproducts.com' NOT NULL,
	"email_from" text,
	"hero_headline" text,
	"hero_subtext" text,
	"story_markdown" text,
	"where_we_sell" jsonb,
	"free_ship_threshold_cents" integer DEFAULT 15000 NOT NULL,
	"flat_shipping_cents" integer DEFAULT 1500 NOT NULL,
	"tiers" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "totp_secrets" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'retailer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"name" text,
	"business_name" text,
	"account_discount_pct" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"shopify_variant_id" text NOT NULL,
	"sku" text,
	"title" text,
	"retail_cents" integer DEFAULT 0 NOT NULL,
	"wholesale_override_cents" integer,
	"inventory_quantity" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "totp_secrets" ADD CONSTRAINT "totp_secrets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_session_idx" ON "orders" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_shopify_id_idx" ON "products" USING btree ("shopify_product_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "variants_shopify_id_idx" ON "variants" USING btree ("shopify_variant_id");--> statement-breakpoint
CREATE INDEX "variants_sku_idx" ON "variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");