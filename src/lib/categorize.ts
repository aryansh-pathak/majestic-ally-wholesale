/**
 * Map a product to one of the 9 catalog chapters. Prefers a real Shopify
 * "Product Type" when the owner has set one; otherwise infers a category from
 * the product title so the catalog filters are meaningful even when Shopify
 * product types are blank.
 *
 * Keep this in sync with scripts/build-fixture.mjs (the seed uses the same logic).
 */
export function categorize(title: string, productType?: string | null): string {
  const pt = (productType || "").trim();
  if (pt && pt.toLowerCase() !== "other" && pt.toLowerCase() !== "hay net") return pt;
  const t = (title || "").toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => t.includes(w));
  if (has("dog collar", "dog leash", "for dogs")) return "Dog Collars";
  if (has("hay net", "hay bag", "hay bale", "slow feed", "hay feeder", "haynet"))
    return "Hay Feeders, Nets & Bags";
  if (has("cinch", "girth")) return "Cinches, Girths & Accessories";
  if (has("saddle cover", "saddle bag", "saddle carrier", "carry bag", "saddle rack"))
    return "Saddle Covers & Bags";
  if (has("stirrup", "fender", "saddle blanket", "saddle pad", "saddle rug", "wither"))
    return "Blankets, Stirrups, Fenders & Pads";
  if (has("fly mask", "fly sheet", "turnout", " sheet", "hood", " boot", "tail bag", "fly veil"))
    return "Blankets, Sheets, Masks & Boots";
  if (has("headstall", "breast collar", "breastcollar", "bridle", "browband", "rein"))
    return "Headstalls, Breast Collars & Bridles";
  if (has("halter", "fleece")) return "Halters & Fleece";
  if (
    has(
      "lead rope", " lead", "cross tie", "trailer tie", "stall guard", "bucket strap",
      "tie for", "stable", "webbing", "hardware", "snap", "buckle", "cross-tie"
    )
  )
    return "Reins, Leads, Ties & Stable";
  return "Other";
}
