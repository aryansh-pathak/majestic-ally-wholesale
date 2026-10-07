import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  ExternalLink,
} from "lucide-react";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { HeroShowcase } from "@/components/hero-showcase";
import { getSettings } from "@/lib/settings";

const CDN = "https://cdn.shopify.com/s/files/1/0405/1759/9398";

// Real catalog imagery + the chapter taglines straight from the 2026 catalog.
const PRODUCT_LINES = [
  {
    name: "Hay Feeders, Nets & Bags",
    note: "Slow-feed technology that stretches every bale — the line your customers come back for.",
    img: `${CDN}/products/MA-0903_BlackAll8colormain.jpg?v=1619365368`,
  },
  {
    name: "Halters & Fleece",
    note: "From everyday nylon to hand-tooled leather — a halter for every horse in the barn.",
    img: `${CDN}/files/1022-Main2.jpg?v=1744959214`,
  },
  {
    name: "Headstalls, Breast Collars & Bridles",
    note: "Hand-tooled leather and matched sets that anchor the western wall.",
    img: `${CDN}/files/1008BCandHS1.jpg?v=1744869729`,
  },
  {
    name: "Reins, Leads, Ties & Stable",
    note: "Handmade leads and reins, the ties that hold it together — and the details every stall needs.",
    img: `${CDN}/files/0920_Brown_main.jpg?v=1744317213`,
  },
  {
    name: "Saddle Covers & Bags",
    note: "Protection and carry solutions for tack, gear and laundry on the move.",
    img: `${CDN}/files/0958_Main_1.jpg?v=1744228588`,
  },
  {
    name: "Blankets, Stirrups, Fenders & Pads",
    note: "From the blanket to the stirrup — everything between horse and rider.",
    img: `${CDN}/files/4ad80f35-4609-5b1d-a07c-956f9a87ff87.jpg?v=1748414665`,
  },
  {
    name: "Cinches, Girths & Accessories",
    note: "The fit that matters most, in neoprene, fleece and mesh.",
    img: `${CDN}/products/062A0414.jpg?v=1700672451`,
  },
  {
    name: "Blankets, Sheets, Masks & Boots",
    note: "Season-round protection, from turnout to fly gear to boots.",
    img: `${CDN}/files/Tur02.jpg?v=1700674830`,
  },
  {
    name: "Dog Collars",
    note: "Western craftsmanship, sized for the dogs — hand-tooled, padded, XS to XL.",
    img: `${CDN}/files/1005-1.jpg?v=1744781880`,
  },
];

// Hero showcase — rotates through real catalog photography with a slow zoom.
const HERO_SLIDES = [
  { img: `${CDN}/files/1008BCandHS1.jpg?v=1744869729`, label: "Tooled Turquoise Headstall & Breast Collar Set" },
  { img: `${CDN}/files/7838b751-2b63-506e-a5f6-69f3d55d8e5d.jpg?v=1748242120`, label: "Hand-Tooled Sunflower Leather Headstall" },
  { img: `${CDN}/products/MA-0903_BlackAll8colormain.jpg?v=1619365368`, label: 'Slow-Feed 42" Hay Net — our top seller' },
  { img: `${CDN}/files/0958_Main_1.jpg?v=1744228588`, label: "Insulated Saddle Bag with Cooler & Bottle Holder" },
  { img: `${CDN}/files/1022-Main2.jpg?v=1744959214`, label: "Designer Bronc Halter, Hand-Tooled Leather Nose" },
  { img: `${CDN}/files/1005-1.jpg?v=1744781880`, label: "Western Hand-Tooled Leather Dog Collar" },
];

// Where the brand already sells, with real storefront links.
const CHANNEL_LINKS: Record<string, string> = {
  Amazon: "https://www.amazon.com/stores/MajesticAlly/page/3C407C0F-6E05-4811-BEC8-72FA5B8DAE76",
  "Walmart Marketplace": "https://www.walmart.com/seller/101425108",
  Walmart: "https://www.walmart.com/seller/101425108",
  Etsy: "https://www.etsy.com/shop/MajesticAllyProducts",
  eBay: "https://www.ebay.com/str/amayinternational",
};

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
          <div className="container-page relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
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
                Over 140 styles — most in a full range of colors. Approved
                retailers see live wholesale pricing and free shipping on every
                order.
              </p>
            </div>

            {/* Hero product showcase — animated real catalog photography */}
            <HeroShowcase slides={HERO_SLIDES} />
          </div>

          {/* Trust bar */}
          <div className="border-t border-cream/10 bg-brand-900/60">
            <div className="container-page grid gap-6 py-6 sm:grid-cols-3">
              <TrustItem
                icon={<Tag className="h-5 w-5" />}
                title="Volume pricing"
                body="Up to 40% off MSRP for approved wholesale accounts."
              />
              <TrustItem
                icon={<Truck className="h-5 w-5" />}
                title="Free freight"
                body="Free shipping on every wholesale order (continental US)."
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
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_LINES.map((line) => (
              <Link
                key={line.name}
                href={`/catalog?category=${encodeURIComponent(line.name)}`}
                className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={line.img}
                    alt={line.name}
                    className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold text-brand-800 group-hover:text-brand-600">
                    {line.name}
                  </h3>
                  <p className="mt-1 text-sm text-brand-800/70">{line.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Story */}
        <section id="story" className="bg-white py-20">
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-100 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${CDN}/files/7838b751-2b63-506e-a5f6-69f3d55d8e5d.jpg?v=1748242120`}
                alt="Hand-tooled leather headstall"
                className="h-full w-full object-contain p-6"
              />
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
            </div>
          </div>
        </section>

        {/* Where we sell */}
        <section id="where-we-sell" className="container-page py-20">
          <h2 className="text-3xl font-semibold text-brand-900">
            Where you already see us
          </h2>
          <p className="mt-3 max-w-2xl text-brand-800/80">
            Majestic Ally sells across major marketplaces and specialty
            channels. Carry the line in your store with wholesale terms.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.whereWeSell.map((channel) => {
              const url = CHANNEL_LINKS[channel];
              if (url) {
                return (
                  <a
                    key={channel}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="badge inline-flex items-center gap-1.5 border border-brand-200 bg-white px-4 py-2 text-sm text-brand-800 transition-colors hover:border-saddle hover:text-saddle-dark"
                  >
                    {channel}
                    <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                  </a>
                );
              }
              return (
                <span
                  key={channel}
                  className="badge border border-brand-200 bg-white px-4 py-2 text-sm text-brand-800"
                >
                  {channel}
                </span>
              );
            })}
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
