import { formatCents } from "@/lib/utils";
import { WHOLESALE_PCT } from "@/lib/pricing";

/**
 * Wholesale price display: MSRP struck through + the flat 40%-off wholesale
 * price. Honors a per-SKU override when set. Wholesale data — only ever
 * rendered on authenticated pages.
 */
export function WholesalePrice({
  retailCents,
  overrideCents,
  from = false,
  size = "md",
}: {
  retailCents: number;
  overrideCents?: number | null;
  from?: boolean;
  size?: "md" | "lg";
}) {
  const wholesale =
    overrideCents != null
      ? overrideCents
      : Math.round((retailCents * (100 - WHOLESALE_PCT)) / 100);
  const big = size === "lg";

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`font-bold text-brand-700 ${big ? "text-3xl" : "text-xl"}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {from && (
          <span className="mr-1 text-sm font-medium text-brand-800/60">from</span>
        )}
        {formatCents(wholesale)}
      </span>
      <span
        className={`text-brand-800/45 line-through ${big ? "text-lg" : "text-sm"}`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatCents(retailCents)}
      </span>
      {overrideCents != null ? (
        <span className="badge bg-saddle/15 text-saddle-dark">Set price</span>
      ) : (
        <span className="badge bg-brand-600 text-cream">{WHOLESALE_PCT}% OFF</span>
      )}
    </div>
  );
}
