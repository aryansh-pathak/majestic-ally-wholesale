"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingCart, AlertCircle, Truck } from "lucide-react";
import { WholesalePrice } from "./wholesale-price";
import { addToCart } from "@/app/cart/actions";
import { formatCents } from "@/lib/utils";
import { WHOLESALE_PCT } from "@/lib/pricing";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductPurchase({ product }: { product: CatalogProduct }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [variantId, setVariantId] = useState<number>(product.variants[0]?.id ?? 0);
  const [qty, setQty] = useState(1);

  const selected = product.variants.find((v) => v.id === variantId);

  function wholesaleOf(v: typeof selected) {
    if (!v) return 0;
    return v.wholesaleOverrideCents != null
      ? v.wholesaleOverrideCents
      : Math.round((v.retailCents * (100 - WHOLESALE_PCT)) / 100);
  }

  function handleAdd() {
    setError(null);
    startTransition(async () => {
      const res = await addToCart(variantId, qty);
      if (res.ok) {
        setAdded(true);
        router.refresh();
        setTimeout(() => setAdded(false), 2500);
      } else {
        setError(res.error || "Could not add to cart.");
      }
    });
  }

  return (
    <div>
      {selected && (
        <WholesalePrice
          retailCents={selected.retailCents}
          overrideCents={selected.wholesaleOverrideCents}
          size="lg"
        />
      )}

      {/* Variant options as selectable pills */}
      {product.variants.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-medium text-brand-800">
            {product.variants.length > 1 ? "Choose an option" : "Option"}
            {selected && (
              <span className="ml-2 font-normal text-brand-800/60">
                {selected.title}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  v.id === variantId
                    ? "border-brand-700 bg-brand-700 text-cream"
                    : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
                }`}
                title={v.sku ?? undefined}
              >
                {v.title}
              </button>
            ))}
          </div>
          {selected?.sku && (
            <div className="mt-2 text-xs text-brand-800/50">
              SKU <span className="font-mono text-saddle-dark">{selected.sku}</span>
            </div>
          )}
        </div>
      )}

      {/* Quantity + add */}
      <div className="mt-6 flex items-end gap-3">
        <div>
          <label className="label" htmlFor="qty">
            Qty
          </label>
          <input
            id="qty"
            type="number"
            min={1}
            max={999}
            value={qty}
            onChange={(e) =>
              setQty(Math.max(1, Math.min(999, Number(e.target.value) || 1)))
            }
            className="input w-24"
          />
        </div>
        <button onClick={handleAdd} disabled={pending} className="btn-primary flex-1">
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : added ? (
            <Check className="h-4 w-4" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {added ? "Added to cart" : "Add to cart"}
        </button>
      </div>

      {selected && (
        <p className="mt-2 text-xs text-brand-800/50">
          {qty} × {formatCents(wholesaleOf(selected))} ={" "}
          <strong>{formatCents(wholesaleOf(selected) * qty)}</strong> at your{" "}
          {WHOLESALE_PCT}% wholesale rate.
        </p>
      )}

      {selected && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {selected.inventoryQuantity > 10 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-green-600" />
              <span className="font-medium text-green-700">In stock</span>
            </>
          ) : selected.inventoryQuantity > 0 ? (
            <>
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-medium text-amber-700">
                Low stock — {selected.inventoryQuantity} on hand
              </span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-brand-300" />
              <span className="font-medium text-brand-800/70">
                Available to order — ships from warehouse
              </span>
            </>
          )}
          <span className="text-brand-800/40">·</span>
          <span className="flex items-center gap-1 text-brand-800/50">
            <Truck className="h-3.5 w-3.5" /> order any quantity
          </span>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
