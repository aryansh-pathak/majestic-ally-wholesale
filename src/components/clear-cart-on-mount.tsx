"use client";

import { useEffect, useRef } from "react";
import { clearCart } from "@/app/cart/actions";

/** Clears the cart cookie once after a successful order (Stripe redirect back). */
export function ClearCartOnMount() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    clearCart().catch(() => {});
  }, []);
  return null;
}
