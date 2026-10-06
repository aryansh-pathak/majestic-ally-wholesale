import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-brand-900 text-cream/80">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm text-cream/60">
            Manufactured equestrian tack, grooming, and western pet goods for
            retailers and resellers.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-cream">Wholesale</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/become-a-retailer" className="hover:text-cream">
                Become a retailer
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-cream">
                Retailer login
              </Link>
            </li>
            <li>
              <Link href="/#where-we-sell" className="hover:text-cream">
                Where we sell
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-cream">Company</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Amay International LLC</li>
            <li>Naperville, Illinois</li>
            <li>
              <a
                href="https://majesticallyproducts.com"
                className="hover:text-cream"
              >
                majesticallyproducts.com
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-cream">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a
                href="mailto:info@majesticallyproducts.com"
                className="hover:text-cream"
              >
                info@majesticallyproducts.com
              </a>
            </li>
            <li>847-660-8389</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-cream/50 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Amay International LLC. All rights
            reserved.
          </span>
          <span>Wholesale pricing is private to approved retailers.</span>
        </div>
      </div>
    </footer>
  );
}
