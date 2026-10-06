import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names safely. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer number of cents as USD, e.g. 2499 -> "$24.99". */
export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents ?? 0) / 100);
}

/** Parse a price string like "24.99" into integer cents (2499). */
export function toCents(price: string | number): number {
  const n = typeof price === "string" ? parseFloat(price) : price;
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
