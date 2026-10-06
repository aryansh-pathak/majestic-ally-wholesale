"use client";

import { useState, useTransition } from "react";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { startCheckout } from "./actions";

export function CheckoutButton({ demo }: { demo: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        className="btn-primary w-full"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await startCheckout();
            if (res?.error) setError(res.error);
            // On success the action redirects, so nothing else to do.
          })
        }
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {demo ? "Place order (demo)" : "Continue to secure payment"}
      </button>
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
