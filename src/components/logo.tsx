import Link from "next/link";
import { cn } from "@/lib/utils";

// Majestic Ally logo. On light backgrounds we show the real logo image from
// the retail site; on dark backgrounds (light=true) we use a clean wordmark.
// To swap the logo, drop a file in /public and change LOGO_SRC.
const LOGO_SRC =
  "https://majesticallyproducts.com/cdn/shop/files/Logo_PNG.png?v=1721900841&width=400";

export function Logo({
  href = "/",
  className,
  light = false,
}: {
  href?: string;
  className?: string;
  light?: boolean;
}) {
  if (light) {
    // Dark background — wordmark in cream.
    return (
      <Link
        href={href}
        className={cn("inline-flex items-center gap-2.5", className)}
        aria-label="Majestic Ally — home"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-cream/40 font-serif text-lg font-semibold text-cream">
          MA
        </span>
        <span className="leading-tight">
          <span className="block font-serif text-lg font-semibold tracking-tight text-cream">
            Majestic Ally
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-cream/70">
            Wholesale
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2", className)}
      aria-label="Majestic Ally — home"
    >
      {/* Real brand logo (renders in production; alt shows where blocked). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt="Majestic Ally"
        className="h-10 w-auto object-contain"
      />
      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-saddle">
        Wholesale
      </span>
    </Link>
  );
}
