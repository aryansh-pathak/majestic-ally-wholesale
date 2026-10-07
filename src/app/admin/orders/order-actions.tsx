"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { deleteOrder } from "./actions";

export function OrderDelete({ id }: { id: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      onClick={() => {
        const ok = window.confirm(
          `Permanently delete order #${id}? This cannot be undone.`
        );
        if (!ok) return;
        start(async () => {
          await deleteOrder(id);
          router.refresh();
        });
      }}
      disabled={pending}
      className="rounded p-1.5 text-red-600 hover:bg-red-50"
      title="Delete order permanently"
      aria-label="Delete order permanently"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
