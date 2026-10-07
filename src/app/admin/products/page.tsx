import Link from "next/link";
import Image from "next/image";
import { Plus, Search, X } from "lucide-react";
import { listAllProducts, listAdminCategories } from "@/lib/admin";
import { formatCents } from "@/lib/utils";
import { ProductRowActions } from "./product-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  const [products, categories] = await Promise.all([
    listAllProducts({ q: sp.q, category: sp.category }),
    listAdminCategories(),
  ]);
  const filtered = !!(sp.q || sp.category);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Products</h1>
          <p className="mt-1 text-sm text-brand-800/60">
            {products.length} {products.length === 1 ? "product" : "products"}
            {filtered ? " match your filter" : ""} · edit prices, hide items, or
            set per-SKU wholesale overrides.
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {/* Search + category filter */}
      <form
        method="get"
        className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
          <input
            type="text"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by SKU or title (e.g. 903 or halter)…"
            className="input w-full pl-9"
          />
        </div>
        <select
          name="category"
          defaultValue={sp.category ?? ""}
          className="input sm:w-64"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">
            Search
          </button>
          {filtered && (
            <Link
              href="/admin/products"
              className="btn-outline inline-flex items-center gap-1"
            >
              <X className="h-4 w-4" /> Clear
            </Link>
          )}
        </div>
      </form>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-brand-100 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-800/60">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Retail</th>
              <th className="px-4 py-3 text-center">Variants</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-100">
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-brand-800/50">
                  No products match your search. <Link href="/admin/products" className="text-saddle-dark underline">Clear filters</Link>
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-brand-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-brand-100 bg-white">
                      {p.featuredImageUrl && (
                        <Image
                          src={p.featuredImageUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="line-clamp-1 max-w-md font-medium text-brand-900">
                        {p.title}
                      </div>
                      <div className="font-mono text-xs text-saddle-dark">
                        {p.baseSku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-brand-800/70">
                  {p.category?.split(",")[0] ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatCents(p.retailMinCents)}
                  {p.hasOverride && (
                    <span className="ml-1 badge bg-saddle/15 text-saddle-dark">
                      override
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-brand-800/70">
                  {p.variantCount}
                </td>
                <td className="px-4 py-3 text-center">
                  {p.hidden ? (
                    <span className="badge bg-amber-100 text-amber-800">Hidden</span>
                  ) : p.status === "active" ? (
                    <span className="badge bg-brand-100 text-brand-700">Live</span>
                  ) : (
                    <span className="badge bg-brand-100 capitalize text-brand-800/60">
                      {p.status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ProductRowActions id={p.id} hidden={p.hidden} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
