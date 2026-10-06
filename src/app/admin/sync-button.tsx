"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Check, AlertCircle } from "lucide-react";
import { refreshShopify } from "./actions";

export function SyncButton() {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null
  );

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        className="btn-outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setResult(null);
            setResult(await refreshShopify());
          })
        }
      >
        <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
        {pending ? "Syncing…" : "Refresh from Shopify"}
      </button>
      {result && (
        <p
          className={`flex items-center gap-1.5 text-xs ${
            result.ok ? "text-brand-600" : "text-red-600"
          }`}
        >
          {result.ok ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {result.message}
        </p>
      )}
    </div>
  );
}
