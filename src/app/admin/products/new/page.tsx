import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewProductForm } from "./new-product-form";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-2 text-2xl font-semibold text-brand-900">Add a product</h1>
      <p className="mb-6 text-sm text-brand-800/60">
        For products managed in Shopify, use “Refresh from Shopify” instead. Use
        this to add an item that isn&apos;t in Shopify.
      </p>
      <NewProductForm />
    </div>
  );
}
