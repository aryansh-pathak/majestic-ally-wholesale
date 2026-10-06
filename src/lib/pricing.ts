/**
 * Wholesale pricing engine.
 *
 * Majestic Ally uses a TIERED VOLUME DISCOUNT off MSRP, applied to the whole
 * order (single invoice), per the 2026 catalog:
 *
 *   $150.00 – $299.99  → 15% off
 *   $300.00 – $499.99  → 20% off
 *   $500.00 and up     → 40% off
 *   below $150.00      → billed at MSRP (0% off)
 *
 * ASSUMPTION (documented for the owner): the tier is decided by the order's
 * MSRP subtotal (the total list value of what's in the cart). This is the
 * simplest rule to explain to a buyer ("order $500 of product, get 40%").
 * If you'd rather base tiers on the discounted subtotal, change getTier().
 *
 * PER-SKU OVERRIDE: any variant can carry an absolute wholesale price
 * (wholesaleOverrideCents). When set, that price is used for that item
 * regardless of tier — use it for MAP-protected or thin-margin SKUs you don't
 * want discounted all the way to 40%.
 */

export type Tier = { minCents: number; pct: number };

// Wholesale is a flat 40% off MSRP for approved retailers. (Kept as a tier
// table so the owner can switch to graduated volume tiers later from Settings.)
export const WHOLESALE_PCT = 40;

export const DEFAULT_TIERS: Tier[] = [{ minCents: 0, pct: WHOLESALE_PCT }];

// TEMPORARY: free shipping on every order until shipping rates are configured.
// Set to false to resume charging per the Admin → Settings shipping amounts.
export const FREE_SHIPPING_EVERYWHERE = true;

/** The discount percent that applies at a given MSRP subtotal. */
export function getTierPct(msrpSubtotalCents: number, tiers: Tier[] = DEFAULT_TIERS): number {
  const sorted = [...tiers].sort((a, b) => a.minCents - b.minCents);
  let pct = 0;
  for (const t of sorted) {
    if (msrpSubtotalCents >= t.minCents) pct = t.pct;
  }
  return pct;
}

/** The next tier a buyer hasn't reached yet — used for the "add $X more" nudge. */
export function nextTier(
  msrpSubtotalCents: number,
  tiers: Tier[] = DEFAULT_TIERS
): { tier: Tier; remainingCents: number } | null {
  const sorted = [...tiers].sort((a, b) => a.minCents - b.minCents);
  for (const t of sorted) {
    if (msrpSubtotalCents < t.minCents) {
      return { tier: t, remainingCents: t.minCents - msrpSubtotalCents };
    }
  }
  return null;
}

/**
 * The wholesale unit price for a variant at a given tier percent.
 * Honors a per-SKU override if present.
 */
export function unitWholesaleCents(
  retailCents: number,
  tierPct: number,
  overrideCents?: number | null
): number {
  if (overrideCents != null) return overrideCents;
  return Math.round((retailCents * (100 - tierPct)) / 100);
}

/** All three tier prices for a variant, for the product-card display. */
export function tierPrices(
  retailCents: number,
  overrideCents?: number | null,
  tiers: Tier[] = DEFAULT_TIERS
): { pct: number; minCents: number; priceCents: number; fixed: boolean }[] {
  return tiers.map((t) => ({
    pct: t.pct,
    minCents: t.minCents,
    priceCents: unitWholesaleCents(retailCents, t.pct, overrideCents),
    fixed: overrideCents != null,
  }));
}

export type CartLineInput = {
  retailCents: number;
  overrideCents?: number | null;
  quantity: number;
};

export type CartTotals = {
  msrpSubtotalCents: number;
  tierPct: number;
  wholesaleSubtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  freeShipping: boolean;
  next: { pct: number; remainingCents: number } | null;
};

/**
 * Compute full cart totals from line inputs. This is the single source of truth
 * for money — the browser never computes prices; the server calls this.
 */
export function computeCart(
  lines: CartLineInput[],
  opts: {
    tiers?: Tier[];
    freeShipThresholdCents?: number;
    flatShippingCents?: number;
    accountDiscountPct?: number | null;
  } = {}
): CartTotals {
  const tiers = opts.tiers ?? DEFAULT_TIERS;
  const freeShipThresholdCents = opts.freeShipThresholdCents ?? 15000;
  const flatShippingCents = opts.flatShippingCents ?? 1500;

  const msrpSubtotalCents = lines.reduce(
    (sum, l) => sum + l.retailCents * l.quantity,
    0
  );

  // A per-account override discount replaces tier logic when set.
  const tierPct =
    opts.accountDiscountPct != null
      ? opts.accountDiscountPct
      : getTierPct(msrpSubtotalCents, tiers);

  const wholesaleSubtotalCents = lines.reduce(
    (sum, l) =>
      sum + unitWholesaleCents(l.retailCents, tierPct, l.overrideCents) * l.quantity,
    0
  );

  const discountCents = msrpSubtotalCents - wholesaleSubtotalCents;
  // TEMPORARY: shipping is free on every order until shipping rates are set up.
  // To start charging, set FREE_SHIPPING_EVERYWHERE = false below and set the
  // "Free shipping at" / "Flat shipping" amounts in Admin → Settings.
  const freeShipping =
    FREE_SHIPPING_EVERYWHERE || msrpSubtotalCents >= freeShipThresholdCents;
  const shippingCents = freeShipping ? 0 : flatShippingCents;
  const totalCents = wholesaleSubtotalCents + shippingCents;

  const nt = nextTier(msrpSubtotalCents, tiers);

  return {
    msrpSubtotalCents,
    tierPct,
    wholesaleSubtotalCents,
    discountCents,
    shippingCents,
    totalCents,
    freeShipping,
    next: nt ? { pct: nt.tier.pct, remainingCents: nt.remainingCents } : null,
  };
}
