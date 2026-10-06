# Running your wholesale portal — the plain-English guide

This is written for you, the owner — not a developer. It covers the two things
you'll actually do: **get the site live** (once), and **run it day to day**.

---

## Part 1 — Getting it live (one afternoon, once)

You'll create four free accounts and paste some keys. I'll walk you through each
one when we do it together. Here's the map so nothing is a surprise:

1. **GitHub** — holds the code. (Free.)
2. **Neon** — the database where your products, retailers, and orders live.
   (Free to start.)
3. **Vercel** — runs the website. (~$20/month for a business site.)
4. **Resend** — sends your emails (inquiries, order confirmations). (Free to
   start.)
5. **Stripe** — takes the card payments. (No monthly fee; ~2.9% + 30¢ per sale.)
6. **Shopify** — you already have this; we just create a "read-only key" so the
   portal can copy your products over.

Every one of these gives you a few values (they look like long random strings).
They all go in **one place** in Vercel: *Settings → Environment Variables*. You
never edit code. When we deploy together, I'll tell you exactly which value goes
where.

**A note on what's yours:** every account above is created under your email and
owned by you. I can't (and shouldn't) create them for you — that keeps you in
full control of your business's logins, money, and data.

---

## Part 2 — Day-to-day, once you're live

Everything below happens in the **Admin** area. Log in with your owner email and
you'll land on the dashboard. On a phone or a laptop, same thing.

### "A store wants to carry us — how do I give them a login?"
Admin → **Retailers** → **Add retailer**. Type their business name and email.
The system makes a password, emails it to them, and shows it to you once so you
can copy it if you like. That's it — they can log in and see pricing.

If you've agreed a special rate with them, put a number in "Account discount %"
(e.g. `40`) and they'll get that flat rate instead of the volume tiers.

### "Someone applied through the website — where does that go?"
Two places: it **emails you** at info@ right away, and it's saved under Admin →
**Inquiries** so nothing gets lost. When you're ready, add them as a retailer
(above).

### "A retailer forgot their password."
Admin → **Retailers** → click the **key icon** on their row. You get a fresh
password to send them. (They can also click "Forgot?" on the login page
themselves.)

### "I need to stop a retailer from ordering."
Admin → **Retailers** → the **ban icon** on their row disables their login. Click
again to turn it back on. Their account and history stay intact.

### "I changed a price / photo / description in Shopify."
Admin → **Dashboard** → **Refresh from Shopify**. It copies over your latest
products, prices, photos, and stock. It also does this **on its own every night**,
so most of the time you don't have to think about it.

### "I want a special wholesale price on one item."
Admin → **Products** → pencil icon on that product. In the pricing table, type a
dollar amount in **Wholesale override** for that variant. Now that item is always
that price for retailers, no matter the order size. Leave it blank to go back to
the normal discount. (Overrides survive the nightly Shopify refresh.)

### "Hide something from retailers without deleting it."
Admin → **Products** → the **eye icon**. Hidden items disappear from the catalog
but stay in your data. (Deleting works too, but a Shopify refresh can bring a
deleted item back — hide is the permanent "don't show this" switch.)

### "An order came in — what do I do?"
You'll get an email, and it shows on the dashboard as "awaiting fulfillment."
Ship it, then Admin → **Orders** → set that order's status to **Fulfilled**. The
money is already collected (Stripe deposits it to your bank on Stripe's normal
schedule).

### "I want to change the words on the homepage, or the discount tiers."
Admin → **Settings**. You can edit the headline, the story, the "where we sell"
list, the notification email, the three pricing tiers, and the free-shipping
threshold — all without anyone touching code. Save, and the public site updates.

---

## Part 3 — Good to know

- **Your prices are private.** A random person on the internet cannot see your
  wholesale prices — not on the page, not by "viewing source," not in any hidden
  data. They only load after someone logs in. This was a core requirement and
  it's built in at the server level.
- **You can't break it by clicking around.** Editing, hiding, and price changes
  are all reversible. The only truly permanent action is *Delete* a product, and
  even then, if it's still in Shopify a refresh brings it back.
- **Where's my money?** Card payments go through Stripe straight to your bank —
  the portal never holds funds. You'll see every payout in your Stripe dashboard.
- **Something looks off?** Check the dashboard first — it shows recent orders,
  recent inquiries, and anything awaiting fulfillment at a glance.

If you ever want a change — a new field on the form, net-30 terms instead of
card, per-store catalogs — those are all straightforward additions. There's a
short list of "things we deferred" at the bottom of the technical README.
