import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { PortalHeader } from "@/components/portal-header";
import { Footer } from "@/components/footer";
import { ProductGallery } from "@/components/product-gallery";
import { ProductPurchase } from "@/components/product-purchase";
import { getProductByHandle } from "@/lib/catalog";
import { cartCount } from "@/lib/cart";
import { WHOLESALE_PCT } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);
  return {
    title: product ? product.title : "Product",
    robots: { index: false, follow: false },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const session = await requireUser();
  const { handle } = await params;

  const [product, count] = await Promise.all([
    getProductByHandle(handle),
    cartCount(),
  ]);

  if (!product) notFound();

  return (
    <>
      <PortalHeader
        role={session.user.role}
        businessName={session.user.businessName}
        cartCount={count}
      />
      <main className="container-page py-6">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1 text-sm text-brand-800/60">
          <Link href="/catalog" className="hover:text-brand-600">
            Catalog
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`/catalog?category=${encodeURIComponent(product.category)}`}
                className="hover:text-brand-600"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-mono text-saddle-dark">{product.baseSku}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <ProductGallery images={product.images} alt={product.title} />

          {/* Details + purchase */}
          <div>
            <h1 className="text-2xl font-semibold leading-snug text-brand-900">
              {product.title}
            </h1>
            {product.description && (
              <p className="mt-3 text-sm leading-relaxed text-brand-800/70">
                {product.description}
              </p>
            )}

            <div className="mt-6 border-t border-brand-100 pt-6">
              <ProductPurchase product={product} />
            </div>

            <div className="mt-6 rounded-lg bg-brand-50 p-4 text-sm text-brand-800/70">
              <strong className="text-brand-800">Wholesale pricing:</strong>{" "}
              approved retailers pay a flat <strong>{WHOLESALE_PCT}% off MSRP</strong>{" "}
              on every item. Free shipping on qualifying orders.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
