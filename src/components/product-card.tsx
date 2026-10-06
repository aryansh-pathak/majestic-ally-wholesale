import Link from "next/link";
import Image from "next/image";
import { Images } from "lucide-react";
import { WholesalePrice } from "./wholesale-price";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const href = product.handle
    ? `/catalog/${product.handle}`
    : `/catalog?q=${product.baseSku ?? ""}`;
  const colorCount = product.variants.length;
  const photoCount = product.images.length;
  const override = product.hasOverride
    ? product.variants.find((v) => v.wholesaleOverrideCents != null)
        ?.wholesaleOverrideCents
    : null;

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <Link
        href={href}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        {product.featuredImageUrl ? (
          <Image
            src={product.featuredImageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200">
            No image
          </div>
        )}
        {photoCount > 1 && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-brand-900/75 px-2 py-0.5 text-[11px] font-medium text-cream">
            <Images className="h-3 w-3" /> {photoCount}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-brand-800/50">
          <span className="font-mono font-medium text-saddle-dark">
            {product.baseSku}
          </span>
          {colorCount > 1 && <span>· {colorCount} options</span>}
          <span className="inline-flex items-center gap-1">
            ·
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                product.inStock ? "bg-green-600" : "bg-brand-300"
              }`}
            />
            {product.inStock ? "In stock" : "Made to order"}
          </span>
        </div>
        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
        >
          {product.title}
        </Link>

        <div className="mt-auto pt-3">
          <WholesalePrice
            retailCents={product.retailMinCents}
            overrideCents={override}
            from={product.retailMinCents !== product.retailMaxCents}
          />
        </div>

        <Link
          href={href}
          className="btn-outline mt-3 w-full text-sm"
          aria-label={`View ${product.title}`}
        >
          View &amp; order
        </Link>
      </div>
    </div>
  );
}
