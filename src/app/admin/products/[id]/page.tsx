import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getProductForEdit } from "@/lib/admin";
import { ProductEditForm } from "../product-edit-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProductForEdit(Number(id));
  if (!data) notFound();

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-brand-600 hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-brand-900">
        Edit product
      </h1>
      <ProductEditForm product={data.product} variants={data.variants} />
    </div>
  );
}
