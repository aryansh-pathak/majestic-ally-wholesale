"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { updateCartItem, removeCartItem } from "@/app/cart/actions";
import { formatCents } from "@/lib/utils";
import type { CartLine } from "@/lib/cart";

export function CartLineRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function setQty(q: number) {
    start(async () => {
      await updateCartItem(line.variantId, q);
      router.refresh();
    });
  }
  function remove() {
    start(async () => {
      await removeCartItem(line.variantId);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={line.productHandle ? `/catalog/${line.productHandle}` : "/catalog"}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-brand-100 bg-white"
      >
        {line.image && (
          <Image
            src={line.image}
            alt=""
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={line.productHandle ? `/catalog/${line.productHandle}` : "/catalog"}
          className="line-clamp-2 text-sm font-semibold text-brand-900 hover:text-brand-600"
        >
          {line.productTitle}
        </Link>
        <div className="mt-0.5 text-xs text-brand-800/50">
          {line.variantTitle} ·{" "}
          <span className="font-mono text-saddle-dark">{line.sku}</span>
        </div>
        <div className="mt-1 text-xs text-brand-800/50">
          <span className="line-through">{formatCents(line.retailCents)}</span>{" "}
          <span className="font-medium text-brand-700">
            {formatCents(line.unitWholesaleCents)} ea
          </span>
          {line.overrideCents != null && (
            <span className="ml-1 text-saddle">(fixed)</span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="inline-flex items-center rounded-md border border-brand-200">
            <button
              type="button"
              onClick={() => setQty(line.quantity - 1)}
              disabled={pending}
              className="px-2.5 py-1 text-brand-700 hover:bg-brand-50 disabled:opacity-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-8 px-2 text-center text-sm font-medium">
              {pending ? (
                <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" />
              ) : (
                line.quantity
              )}
            </span>
            <button
              type="button"
              onClick={() => setQty(line.quantity + 1)}
              disabled={pending}
              className="px-2.5 py-1 text-brand-700 hover:bg-brand-50 disabled:opacity-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center gap-1 text-xs text-brand-800/50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
        </div>
      </div>

      <div className="text-right text-sm font-semibold text-brand-900">
        {formatCents(line.lineTotalCents)}
      </div>
    </div>
  );
}
