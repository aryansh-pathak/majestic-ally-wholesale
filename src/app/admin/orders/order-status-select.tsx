"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setOrderStatus } from "./actions";

const OPTIONS = ["pending", "paid", "fulfilled", "cancelled"] as const;

export function OrderStatusSelect({
  id,
  status,
}: {
  id: number;
  status: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex items-center gap-2">
      <select
        value={status}
        disabled={pending}
        onChange={(e) =>
          start(async () => {
            await setOrderStatus(id, e.target.value as (typeof OPTIONS)[number]);
            router.refresh();
          })
        }
        className="input w-32 py-1.5 text-sm capitalize"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o} className="capitalize">
            {o}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-400" />}
    </span>
  );
}
