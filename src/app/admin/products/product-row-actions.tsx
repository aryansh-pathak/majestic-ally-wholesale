"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Pencil, Loader2 } from "lucide-react";
import { setProductHidden, deleteProduct } from "./actions";

export function ProductRowActions({
  id,
  hidden,
}: {
  id: number;
  hidden: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/admin/products/${id}`}
        className="rounded p-1.5 text-brand-700 hover:bg-brand-100"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        onClick={() => start(async () => { await setProductHidden(id, !hidden); router.refresh(); })}
        disabled={pending}
        className="rounded p-1.5 text-brand-700 hover:bg-brand-100"
        aria-label={hidden ? "Show" : "Hide"}
        title={hidden ? "Hidden — click to show" : "Visible — click to hide"}
      >
        {hidden ? <EyeOff className="h-4 w-4 text-amber-600" /> : <Eye className="h-4 w-4" />}
      </button>
      {confirming ? (
        <span className="flex items-center gap-1">
          <button
            onClick={() => start(async () => { await deleteProduct(id); router.refresh(); })}
            disabled={pending}
            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="rounded px-1.5 py-1 text-xs text-brand-800/60"
          >
            Cancel
          </button>
        </span>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded p-1.5 text-red-600 hover:bg-red-50"
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
