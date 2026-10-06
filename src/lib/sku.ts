/**
 * SKU search helpers.
 *
 * Your SKUs look like "MA-0903" at the product level and "MA-0903-BLK" at the
 * variant level. Retailers want to type just the digits ("903") and find it.
 * We match on the *numeric core* of the SKU so the prefix and leading zeros
 * don't matter, and also allow matching the full SKU text and the title.
 */

/** Keep only the digits of a string. "MA-0903-BLK" -> "0903". */
export function digitsOf(s: string): string {
  return (s || "").replace(/\D/g, "");
}

/** Strip leading zeros. "0903" -> "903" (but "000" -> "0"). */
export function stripLeadingZeros(s: string): string {
  const stripped = s.replace(/^0+/, "");
  return stripped === "" ? (s.length ? "0" : "") : stripped;
}

/**
 * Does a variant SKU match a user's typed query?
 * Matches when the numeric core of the SKU contains the numeric core of the
 * query (so "903" finds "MA-0903"), or when the raw text matches.
 */
export function skuMatches(sku: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const skuLower = (sku || "").toLowerCase();
  if (skuLower.includes(q)) return true;

  const qDigits = stripLeadingZeros(digitsOf(q));
  if (!qDigits) return false;
  const skuDigits = stripLeadingZeros(digitsOf(sku));
  return skuDigits.includes(qDigits);
}

/**
 * Build the "%digits%" pattern used in the SQL LIKE for numeric matching.
 * Returns null when the query has no digits.
 */
export function numericLikePattern(query: string): string | null {
  const qDigits = stripLeadingZeros(digitsOf(query));
  return qDigits ? `%${qDigits}%` : null;
}
