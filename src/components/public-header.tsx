import Link from "next/link";
import { Logo } from "./logo";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-cream/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-brand-800 md:flex">
          <Link href="/#story" className="hover:text-brand-500">
            Our story
          </Link>
          <Link href="/#lines" className="hover:text-brand-500">
            Product lines
          </Link>
          <Link href="/#where-we-sell" className="hover:text-brand-500">
            Where we sell
          </Link>
          <Link href="/become-a-retailer" className="hover:text-brand-500">
            Become a retailer
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-outline hidden sm:inline-flex">
            Retailer login
          </Link>
          <Link href="/become-a-retailer" className="btn-primary">
            Apply
          </Link>
        </div>
      </div>
    </header>
  );
}
