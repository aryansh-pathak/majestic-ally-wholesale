"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createProduct } from "../actions";

export function NewProductForm() {
  const [state, action, pending] = useActionState(createProduct, null);

  return (
    <form action={action} className="card space-y-4 p-6">
      {state?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <div>
        <label className="label" htmlFor="title">Title</label>
        <input id="title" name="title" className="input" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="sku">SKU</label>
          <input id="sku" name="sku" className="input" placeholder="MA-1234" required />
        </div>
        <div>
          <label className="label" htmlFor="retail">Retail price (MSRP)</label>
          <input id="retail" name="retail" className="input" placeholder="24.99" inputMode="decimal" required />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="category">Category</label>
        <input id="category" name="category" className="input" placeholder="Hay Feeders, Nets & Bags" />
      </div>
      <div>
        <label className="label" htmlFor="image">Image URL</label>
        <input id="image" name="image" className="input" placeholder="https://…" />
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} className="input" />
      </div>
      <button type="submit" className="btn-primary" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Create product
      </button>
    </form>
  );
}
