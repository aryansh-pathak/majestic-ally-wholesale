import Link from "next/link";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { listProducts, listCategories } from "@/lib/catalog";
import { cartCount } from "@/lib/cart";
import { WHOLESALE_PCT } from "@/lib/pricing";
import { PackageX } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Wholesale Catalog",
  robots: { index: false, follow: false },
};

// The 9 catalog chapters, in catalog order; anything else falls to the end.
const CATEGORY_ORDER = [
  "Hay Feeders, Nets & Bags",
  "Halters & Fleece",
  "Headstalls, Breast Collars & Bridles",
  "Reins, Leads, Ties & Stable",
  "Saddle Covers & Bags",
  "Blankets, Stirrups, Fenders & Pads",
  "Cinches, Girths & Accessories",
  "Blankets, Sheets, Masks & Boots",
  "Dog Collars",
];

function orderIndex(cat: string) {
  const i = CATEGORY_ORDER.indexOf(cat);
  return i === -1 ? CATEGORY_ORDER.length : i;
}

function slug(cat: string) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const session = await requireUser();
  const sp = await searchParams;

  const [products, categories, count] = await Promise.all([
    listProducts({ q: sp.q, category: sp.category }),
    listCategories(),
    cartCount(),
  ]);

  const sortedCats = [...categories].sort(
    (a, b) => orderIndex(a) - orderIndex(b) || a.localeCompare(b)
  );

  // Group products by category (only when not searching / not filtered to one).
  const grouped = new Map<string, typeof products>();
  for (const p of products) {
    const c = p.category || "Other";
    if (!grouped.has(c)) grouped.set(c, []);
    grouped.get(c)!.push(p);
  }
  const groupedCats = [...grouped.keys()].sort(
    (a, b) => orderIndex(a) - orderIndex(b) || a.localeCompare(b)
  );

  const searching = !!sp.q;

  return (
    <>
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={count}
      />
      <main className="container-page py-6">
        {/* Heading */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-brand-900">
            {searching
              ? `Results for “${sp.q}”`
              : sp.category || "Wholesale catalog"}
          </h1>
          <p className="mt-1 text-sm text-brand-800/60">
            {products.length} {products.length === 1 ? "product" : "products"} ·
            Your wholesale price is <strong>{WHOLESALE_PCT}% off MSRP</strong>.
          </p>
        </div>

        {/* Category nav */}
        {!searching && (
          <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-brand-100 bg-cream/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/catalog"
                className={`badge border px-3 py-1.5 text-sm transition-colors ${
                  !sp.category
                    ? "border-brand-700 bg-brand-700 text-cream"
                    : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
                }`}
              >
                All
              </Link>
              {sortedCats.map((c) => (
                <Link
                  key={c}
                  href={`/catalog?category=${encodeURIComponent(c)}`}
                  className={`badge border px-3 py-1.5 text-sm transition-colors ${
                    sp.category === c
                      ? "border-brand-700 bg-brand-700 text-cream"
                      : "border-brand-200 bg-white text-brand-800 hover:border-brand-400"
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        )}

        {products.length === 0 ? (
          <div className="card mt-8 flex flex-col items-center gap-3 p-12 text-center">
            <PackageX className="h-10 w-10 text-brand-300" />
            <p className="text-brand-800/70">
              No products match{sp.q ? ` “${sp.q}”` : " that filter"}.
            </p>
            <Link href="/catalog" className="btn-outline">
              Clear
            </Link>
          </div>
        ) : searching || sp.category ? (
          // Flat grid for search or single-category view
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          // Grouped by category
          <div className="space-y-12">
            {groupedCats.map((cat) => (
              <section key={cat} id={slug(cat)} className="scroll-mt-32">
                <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-brand-100 pb-2">
                  <h2 className="text-lg font-semibold text-brand-900">{cat}</h2>
                  <span className="text-sm text-brand-800/50">
                    {grouped.get(cat)!.length} items
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {grouped.get(cat)!.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
