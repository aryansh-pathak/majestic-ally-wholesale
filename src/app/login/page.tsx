import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Retailer Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  const target = callbackUrl || "/catalog";
  if (session?.user) redirect(session.user.role === "owner" ? "/admin" : target);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo light />
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-brand-900">
            Retailer sign in
          </h1>
          <p className="mt-1 text-sm text-brand-800/70">
            Access your wholesale catalog and pricing.
          </p>
          <div className="mt-6">
            <LoginForm callbackUrl={target} />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-cream/70">
          Not a retailer yet?{" "}
          <Link
            href="/become-a-retailer"
            className="font-medium text-cream underline"
          >
            Apply for an account
          </Link>
        </p>
      </div>
    </main>
  );
}
