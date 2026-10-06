import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  PackageCheck,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { getSettings } from "@/lib/settings";

// Public marketing page — no gated pricing here. The nine product lines below
// are editable marketing copy (Admin → Settings can be extended to manage them).
const PRODUCT_LINES = [
  { name: "Hay Feeders, Nets & Bags", note: "Slow-feed nets & bags — our best-moving line" },
  { name: "Halters & Fleece", note: "Nylon halters with fleece-lined comfort" },
  { name: "Headstalls, Breast Collars & Bridles", note: "Nylon & hand-tooled leather, matched sets" },
  { name: "Reins, Leads, Ties & Stable", note: "Everyday barn and stable essentials" },
  { name: "Saddle Covers & Bags", note: "Protective covers and carry bags" },
  { name: "Blankets, Stirrups, Fenders & Pads", note: "Saddle pads and riding hardware" },
  { name: "Cinches, Girths & Accessories", note: "Western cinches and girth accessories" },
  { name: "Sheets, Masks & Boots", note: "Turnout sheets, fly masks, and boots" },
  { name: "Dog Collars", note: "Hand-tooled western collars, XS–XL" },
];

// Reads editable settings from the DB at request time.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await getSettings();

  return (
    <>
      <PublicHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-900">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #d0a46c 0, transparent 45%), radial-gradient(circle at 80% 0, #b07a3c 0, transparent 40%)",
            }}
            aria-hidden
          />
          <div className="container-page relative grid gap-10 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <span className="badge bg-saddle/20 text-saddle-light">
                Wholesale · Retailers & Resellers
              </span>
              <h1 className="mt-4 text-4xl font-semibold leading-[1.1] text-cream sm:text-5xl">
                {settings.heroHeadline}
              </h1>
              <p className="mt-5 max-w-xl text-lg text-cream/70">
                {settings.heroSubtext}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/become-a-retailer" className="btn-saddle text-base">
                  Become a retailer <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="btn text-base border border-cream/30 text-cream hover:bg-cream/10"
                >
                  Retailer login
                </Link>
              </div>
              <p className="mt-4 text-sm text-cream/50">
                Approved retailers see live wholesale pricing across 140+ styles.
              </p>
            </div>

            {/* Hero image placeholder */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-cream/15 bg-gradient-to-br from-brand-700 to-brand-800 shadow-2xl">
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-cream/50">
                  <PackageCheck className="h-10 w-10" />
                  <span className="text-sm font-medium">
                    [ Placeholder — add your brand / product hero image ]
                  </span>
                  <span className="text-xs">
                    Drop a photo in /public and swap this block
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="border-t border-cream/10 bg-brand-900/60">
            <div className="container-page grid gap-6 py-6 sm:grid-cols-3">
              <TrustItem
                icon={<Tag className="h-5 w-5" />}
                title="Volume pricing"
                body="Tiered discounts up to 40% off MSRP for approved accounts."
              />
              <TrustItem
                icon={<Truck className="h-5 w-5" />}
                title="Free freight"
                body="Free shipping on all wholesale orders (continental US)."
              />
              <TrustItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Private pricing"
                body="Your wholesale prices are visible only after you log in."
              />
            </div>
          </div>
        </section>

        {/* Product lines */}
        <section id="lines" className="container-page py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold text-brand-900">
              Nine product lines, one purchase order
            </h2>
            <p className="mt-3 text-brand-800/80">
              A full equestrian and western pet catalog — English, Western, and
              universal barn essentials — so you can round out a section from a
              single supplier.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <div key={line.name} className="card p-5">
                <h3 className="text-lg font-semibold text-brand-800">
                  {line.name}
                </h3>
                <p className="mt-1 text-sm text-brand-800/70">{line.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section id="story" className="bg-white py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-100 bg-brand-50">
              <div className="flex h-full items-center justify-center p-6 text-center text-brand-300">
                [ Placeholder — brand / workshop photo ]
              </div>
            </div>
            <div>
              <span className="badge bg-brand-100 text-brand-700">
                Our story
              </span>
              <h2 className="mt-4 text-3xl font-semibold text-brand-900">
                Built for barns, priced for shelves.
              </h2>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-brand-800/80">
                {settings.storyMarkdown.replace(/\*\*/g, "")}
              </p>
              <p className="mt-4 text-sm text-brand-800/60">
                Edit this copy any time from <strong>Admin → Settings</strong> —
                no code required.
              </p>
            </div>
          </div>
        </section>

        {/* Where we sell */}
        <section id="where-we-sell" className="container-page py-20">
          <h2 className="text-3xl font-semibold text-brand-900">
            Where you already see us
          </h2>
          <p className="mt-3 max-w-2xl text-brand-800/80">
            Majestic Ally products sell across major marketplaces and specialty
            channels. Carry the line in your store with wholesale terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.whereWeSell.map((channel) => (
              <span
                key={channel}
                className="badge border border-brand-200 bg-white px-4 py-2 text-sm text-brand-800"
              >
                {channel}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-900">
          <div className="container-page flex flex-col items-center gap-6 py-16 text-center">
            <h2 className="max-w-2xl text-3xl font-semibold text-cream">
              Ready to carry Majestic Ally?
            </h2>
            <p className="max-w-xl text-cream/70">
              Apply for a wholesale account. We&apos;ll review your details and
              set up your private login — usually within a couple of business
              days.
            </p>
            <Link href="/become-a-retailer" className="btn-saddle text-base">
              Apply for wholesale access <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function TrustItem({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-saddle/20 text-saddle-light">
        {icon}
      </span>
      <div>
        <div className="text-sm font-semibold text-cream">{title}</div>
        <div className="text-sm text-cream/60">{body}</div>
      </div>
    </div>
  );
}
