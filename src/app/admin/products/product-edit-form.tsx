"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { saveProduct } from "./actions";
import { formatCents } from "@/lib/utils";
import { DEFAULT_TIERS } from "@/lib/pricing";

type Variant = {
  id: number;
  sku: string | null;
  title: string | null;
  retailCents: number;
  wholesaleOverrideCents: number | null;
  inventoryQuantity: number;
};

type Product = {
  id: number;
  title: string;
  category: string | null;
  description: string | null;
  status: "active" | "draft" | "archived";
  hidden: boolean;
  featuredImageUrl: string | null;
  baseSku: string | null;
};

const TOP_PCT = DEFAULT_TIERS[DEFAULT_TIERS.length - 1].pct;

export function ProductEditForm({
  product,
  variants,
}: {
  product: Product;
  variants: Variant[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          setError(null);
          const res = await saveProduct(fd);
          if (res?.ok) {
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 2500);
          } else {
            setError(res?.error || "Could not save.");
          }
        });
      }}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={product.id} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main fields */}
        <div className="card space-y-4 p-6">
          <div>
            <label className="label" htmlFor="title">Title</label>
            <input id="title" name="title" defaultValue={product.title} className="input" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="category">Category</label>
              <input id="category" name="category" defaultValue={product.category ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select id="status" name="status" defaultValue={product.status} className="input">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" name="description" defaultValue={product.description ?? ""} rows={4} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="featuredImageUrl">Featured image URL</label>
            <input id="featuredImageUrl" name="featuredImageUrl" defaultValue={product.featuredImageUrl ?? ""} className="input" />
          </div>
        </div>

        {/* Visibility */}
        <div className="card h-fit space-y-4 p-6">
          <h3 className="font-semibold text-brand-900">Visibility</h3>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="hidden" defaultChecked={product.hidden} className="h-4 w-4 rounded border-brand-300" />
            Hide from the wholesale catalog
          </label>
          <p className="text-xs text-brand-800/50">
            Hidden products stay in your data but don&apos;t show to retailers.
          </p>
          <div className="rounded-lg bg-brand-50 p-3 text-xs text-brand-800/70">
            <span className="font-mono text-saddle-dark">{product.baseSku}</span>
          </div>
        </div>
      </div>

      {/* Variants + pricing */}
      <div className="card overflow-x-auto p-0">
        <div className="border-b border-brand-100 px-6 py-4">
          <h3 className="font-semibold text-brand-900">Variants & pricing</h3>
          <p className="text-xs text-brand-800/50">
            Leave the override blank to use the standard tier discount. Set it to
            fix a SKU&apos;s wholesale price regardless of order size.
          </p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-800/60">
            <tr>
              <th className="px-4 py-2">Variant</th>
              <th className="px-4 py-2">SKU</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Retail (MSRP)</th>
              <th className="px-4 py-2">Wholesale override</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="px-4 py-2 font-medium text-brand-900">{v.title}</td>
                <td className="px-4 py-2 font-mono text-xs text-saddle-dark">{v.sku}</td>
                <td className="px-4 py-2 text-brand-800/60">{v.inventoryQuantity}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-brand-800/50">$</span>
                    <input
                      name={`retail_${v.id}`}
                      defaultValue={(v.retailCents / 100).toFixed(2)}
                      className="input w-24 py-1.5"
                      inputMode="decimal"
                    />
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-brand-800/50">$</span>
                    <input
                      name={`override_${v.id}`}
                      defaultValue={
                        v.wholesaleOverrideCents != null
                          ? (v.wholesaleOverrideCents / 100).toFixed(2)
                          : ""
                      }
                      placeholder={`${(Math.round((v.retailCents * (100 - TOP_PCT)) / 100) / 100).toFixed(2)} (auto)`}
                      className="input w-32 py-1.5"
                      inputMode="decimal"
                    />
                  </div>
                  <div className="mt-0.5 text-[11px] text-brand-800/40">
                    auto {TOP_PCT}% = {formatCents(Math.round((v.retailCents * (100 - TOP_PCT)) / 100))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-brand-100 bg-cream/90 py-3 backdrop-blur">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save changes"}
        </button>
        <span className="text-xs text-brand-800/50">
          Changes apply to the retailer catalog immediately.
        </span>
      </div>
    </form>
  );
}
