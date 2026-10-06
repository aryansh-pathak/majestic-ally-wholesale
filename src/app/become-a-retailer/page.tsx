import type { Metadata } from "next";
import { PublicHeader } from "@/components/public-header";
import { Footer } from "@/components/footer";
import { RetailerForm } from "./retailer-form";
import { BadgeCheck, Clock, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Become a Retailer",
  description:
    "Apply for a Majestic Ally wholesale account. Approved retailers get private pricing across 140+ styles of equestrian and pet gear.",
};

export default function BecomeARetailerPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-white">
        <section className="container-page grid gap-12 py-16 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="badge bg-brand-100 text-brand-700">
              Wholesale application
            </span>
            <h1 className="mt-4 text-4xl font-semibold text-brand-900">
              Carry Majestic Ally in your store
            </h1>
            <p className="mt-4 text-lg text-brand-800/80">
              Tell us a little about your business. Once approved, you&apos;ll
              get a private login to browse the full line and see your wholesale
              pricing.
            </p>

            <ul className="mt-8 space-y-4">
              <Benefit
                icon={<Lock className="h-5 w-5" />}
                title="Private pricing"
                body="Wholesale prices are never public — visible only inside your account."
              />
              <Benefit
                icon={<BadgeCheck className="h-5 w-5" />}
                title="Up to 40% off MSRP"
                body="Tiered volume discounts, with free freight on qualifying orders."
              />
              <Benefit
                icon={<Clock className="h-5 w-5" />}
                title="Fast setup"
                body="Most accounts are reviewed and activated within a couple of business days."
              />
            </ul>
          </div>

          <RetailerForm />
        </section>
      </main>
      <Footer />
    </>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        {icon}
      </span>
      <div>
        <div className="font-semibold text-brand-900">{title}</div>
        <div className="text-sm text-brand-800/70">{body}</div>
      </div>
    </li>
  );
}
