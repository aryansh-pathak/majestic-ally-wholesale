# Majestic Ally — Wholesale Portal

A private B2B wholesale portal for Majestic Ally / Amay International LLC. Public
marketing site + a login-gated catalog where approved retailers see their
wholesale pricing, build an order, and pay by card. Plus an owner admin to run
it all without touching code.

- **Public site:** brand story, product lines, "where we sell," and a "Become a
  Retailer" application form that emails you.
- **Retailer portal (login required):** full catalog **grouped by category**,
  multi-image product galleries, a flat **40% off MSRP** wholesale price (MSRP
  struck through), per-SKU price overrides, forgiving SKU search
  (type `903` → finds `MA-0903`), cart, and **Stripe checkout**.
- **Owner admin (you only):** products & per-SKU price overrides, retailer
  logins, orders, inquiries, editable site copy/pricing, and one-click **Refresh
  from Shopify**.

Wholesale prices are **gated server-side** — they are never sent to a logged-out
visitor or exposed in page source.

---

## 1. Tech stack (and why)

| Piece | Choice | Why |
|------|--------|-----|
| Framework | **Next.js 15** (App Router, TypeScript) | Prices computed on the server; nothing sensitive reaches the browser. |
| Database | **Neon** (managed Postgres) | Serverless Postgres, generous free tier, nothing to babysit. |
| ORM | **Drizzle** | Typed, lightweight, plays well with serverless. |
| Auth | **Auth.js (NextAuth v5)** | Sessions, bcrypt password hashing, password reset. |
| Payments | **Stripe Checkout** (hosted) | Card data never touches our server — minimal PCI burden. |
| Email | **Resend** | Simple transactional email; recipient editable in admin. |
| Hosting | **Vercel** | Push-to-deploy, cron built in. |
| Catalog source | **Shopify Admin API** | Your Shopify stays the source of truth for products. |

**Local preview needs no database:** with no `DATABASE_URL`, the app uses an
in-process Postgres (PGlite) so `npm run dev` just works. Production always uses
Neon.

---

## 2. Run it locally

```bash
npm install
cp .env.example .env.local     # you can leave most values blank for local dev
npm run db:seed-local          # creates owner + demo retailer + sample products
npm run dev                    # http://localhost:3000
```

Local logins created by the seed:

- **Owner:** `info@majesticallyproducts.com` / `ChangeMe!2026`
- **Demo retailer:** `retailer@example.com` / `Retailer!2026`

(Change these via `OWNER_EMAIL` / `OWNER_PASSWORD` in `.env.local` before
seeding, or change the password after logging in.)

Without Stripe keys, checkout runs in **demo mode** (no card charged) so you can
see the whole flow.

---

## 3. Where every key/setting lives

All secrets are environment variables. Locally they go in `.env.local`; in
production you set the same names in **Vercel → Project → Settings →
Environment Variables**. See `.env.example` for the annotated list. The
important ones:

| Variable | What it's for | Where to get it |
|----------|---------------|-----------------|
| `AUTH_SECRET` | Signs login sessions | `openssl rand -base64 32` |
| `DATABASE_URL` | Neon Postgres connection | Neon dashboard → Connection string (pooled) |
| `RESEND_API_KEY` | Sending email | resend.com → API Keys |
| `EMAIL_FROM` | "From" address | A domain you verified in Resend |
| `STRIPE_SECRET_KEY` | Payments | dashboard.stripe.com → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Confirming paid orders | Stripe → Developers → Webhooks |
| `SHOPIFY_STORE_DOMAIN` | Your store | e.g. `majesticallyproducts.myshopify.com` |
| `SHOPIFY_ADMIN_TOKEN` | Pulling catalog | Shopify custom app (below) |
| `CRON_SECRET` | Protects the nightly sync URL | `openssl rand -hex 16` |
| `NEXTAUTH_URL` | Your site URL | e.g. `https://wholesale.majesticallyproducts.com` |

**Settings you can change without code** (Admin → Settings): the notification
email, the "from" address, all public site copy, the pricing tiers, the
free-shipping threshold, and shipping cost. These live in the database, not in
env vars, and override the defaults.

---

## 4. Everyday tasks

### Add a retailer
Admin → **Retailers** → **Add retailer**. Enter their business + email. A
password is auto-generated and emailed to them (and shown to you once to copy).
Optionally set a flat account discount that overrides the volume tiers. The
public form never creates accounts — it only sends you a lead.

### Disable / reset a retailer
Admin → **Retailers** → the icons on each row: the key resets their password
(shows you a new one to share); the ban icon disables their login (they can't
sign in until re-enabled).

### Edit a product / set a wholesale override
Admin → **Products** → pencil icon. Edit title, category, description, image,
status, and per-variant retail price. Leave **Wholesale override** blank to use
the standard tier discount, or set a dollar amount to fix that SKU's wholesale
price regardless of order size (for MAP-protected or thin-margin items). Changes
show to retailers immediately.

### Hide or delete a product
On the Products list: the eye icon hides an item from the catalog (keeps the
data); the trash icon deletes it. A **Refresh from Shopify** will re-add a
deleted product if it still exists in Shopify — use **Hide** to keep something
out permanently.

### Refresh the catalog from Shopify
Admin → **Dashboard** → **Refresh from Shopify** pulls current products, prices,
images, and stock. It also runs **automatically every night** (Vercel Cron,
`vercel.json`). Your per-SKU wholesale overrides are preserved across syncs.

### Fulfill orders
Admin → **Orders** → change the status dropdown (Paid → Fulfilled). Paid orders
awaiting fulfillment are flagged on the dashboard. Each order also emailed you
when it was placed.

---

## 5. Connect Shopify (one-time)

1. Shopify admin → **Settings → Apps and sales channels → Develop apps →
   Create an app**. Name it "Wholesale Portal Sync."
2. **Configure Admin API scopes** → enable `read_products` and
   `read_inventory`. Save.
3. **Install app**, then reveal the **Admin API access token**
   (`shpat_...`). Copy it into `SHOPIFY_ADMIN_TOKEN`, and set
   `SHOPIFY_STORE_DOMAIN` to `your-store.myshopify.com`.
4. In admin, click **Refresh from Shopify**. Done.

Category comes from each product's **Product type** in Shopify — set those (or
we default to "Other"); you can also edit a product's category in the admin.

---

## 6. Deploy to production

Detailed click-by-click steps are in **OWNER-GUIDE.md**. In short:

1. Push this repo to GitHub.
2. **Neon:** create a project → copy the pooled connection string → `DATABASE_URL`.
3. **Vercel:** import the repo → add all env vars from `.env.example` → deploy.
4. Run migrations against Neon once: `DATABASE_URL=... npm run db:push`, then
   seed your owner account: `DATABASE_URL=... npm run db:seed`.
5. **Resend:** verify your sending domain → `RESEND_API_KEY` + `EMAIL_FROM`.
6. **Stripe:** add keys → add a webhook to
   `https://your-domain/api/stripe/webhook` (event
   `checkout.session.completed`) → copy the signing secret to
   `STRIPE_WEBHOOK_SECRET`.
7. **Shopify:** custom app token (section 5).
8. Point your domain (e.g. `wholesale.majesticallyproducts.com`) at Vercel and
   set `NEXTAUTH_URL` to it.

Estimated run cost: **$0–20/mo** (Vercel Pro is ~$20/mo for commercial use;
Neon/Resend free tiers are fine to start) **+ Stripe fees** (2.9% + 30¢).

---

## 7. Security notes

- Wholesale pricing is fetched and rendered **server-side only**, behind an
  auth check. Logged-out visitors get a 307 redirect; no prices in page source
  or network calls.
- Two roles: **owner** (you) and **retailer**. `/admin` is owner-only, enforced
  in middleware **and** re-checked in the admin layout.
- Passwords are **bcrypt**-hashed (cost 12). Sessions are signed JWTs in
  httpOnly cookies. Password reset tokens are single-use, hashed, 1-hour expiry.
- All form input is validated with **Zod**. Security headers set in
  `next.config.ts`. The public form has a honeypot; login and the form have a
  best-effort rate limit.
- Cart contents live in an httpOnly cookie, but **every price is recomputed on
  the server** at checkout — the client can't alter pricing.
- Stripe webhook is **signature-verified**; the cron endpoint requires
  `CRON_SECRET`.

### Hardening (recommended next)
- Add **Upstash Redis** for a shared rate limiter (the built-in one is
  per-instance). See `src/lib/rate-limit.ts`.
- Turn on **2FA** for the owner (the DB schema is ready; UI is a fast add).
- Consider a Content-Security-Policy header once your asset domains are fixed.

---

## 8. Deferred to a later phase

- **Retailer ordering & checkout is DONE** (cart + Stripe). What's intentionally
  left for later:
  - **Owner-managed 2FA UI** (schema exists; enrollment screen not built).
  - **Net-terms / "invoice me" checkout** as an alternative to card (design
    noted; ~1–2 days to add a terms path + owner approval).
  - **Shipping-rate logic beyond a flat/free threshold** (real-time carrier
    rates).
  - **Per-retailer catalogs / MOQ rules** (everyone sees the full catalog now).
  - **Richer product media** (single featured image today; gallery is easy to add).

---

## Project layout

```
src/
  app/                 routes (public, portal, admin, api)
  components/          shared UI
  lib/
    pricing.ts         tier math (single source of truth for money)
    cart.ts            server-computed cart
    orders.ts          order creation + confirmation emails
    catalog.ts         product queries + SKU search
    shopify.ts         Shopify Admin API sync
    admin.ts           admin data
    auth-helpers.ts    requireUser / requireOwner
  db/                  Drizzle schema + connection
scripts/               seed + Shopify sync CLI
drizzle/               generated SQL migrations
```
