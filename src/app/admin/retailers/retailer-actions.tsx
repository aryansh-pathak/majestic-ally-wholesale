"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Ban, CheckCircle, Loader2, Copy, Trash2 } from "lucide-react";
import {
  setRetailerStatus,
  resetRetailerPassword,
  deleteRetailer,
} from "./actions";

export function RetailerActions({
  id,
  status,
  businessName,
}: {
  id: number;
  status: "active" | "disabled";
  businessName?: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [temp, setTemp] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-end gap-1">
      {temp && (
        <span className="mr-2 inline-flex items-center gap-1 rounded bg-brand-50 px-2 py-1 text-xs">
          <code className="font-mono">{temp}</code>
          <button
            onClick={() => navigator.clipboard?.writeText(temp)}
            className="text-brand-600"
            aria-label="Copy password"
          >
            <Copy className="h-3 w-3" />
          </button>
        </span>
      )}
      <button
        onClick={() =>
          start(async () => {
            const res = await resetRetailerPassword(id);
            if (res.tempPassword) setTemp(res.tempPassword);
          })
        }
        disabled={pending}
        className="rounded p-1.5 text-brand-700 hover:bg-brand-100"
        title="Reset password"
        aria-label="Reset password"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
      </button>
      <button
        onClick={() =>
          start(async () => {
            await setRetailerStatus(id, status === "active" ? "disabled" : "active");
            router.refresh();
          })
        }
        disabled={pending}
        className={`rounded p-1.5 hover:bg-brand-100 ${status === "active" ? "text-red-600" : "text-brand-600"}`}
        title={status === "active" ? "Disable access" : "Enable access"}
        aria-label={status === "active" ? "Disable access" : "Enable access"}
      >
        {status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
      </button>
      <button
        onClick={() => {
          const ok = window.confirm(
            `Permanently delete ${businessName || "this retailer"}? This also deletes their orders and cannot be undone.`
          );
          if (!ok) return;
          start(async () => {
            const res = await deleteRetailer(id);
            if (!res.ok) {
              window.alert(res.message || "Could not delete this account.");
              return;
            }
            router.refresh();
          });
        }}
        disabled={pending}
        className="rounded p-1.5 text-red-600 hover:bg-red-50"
        title="Delete account permanently"
        aria-label="Delete account permanently"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
