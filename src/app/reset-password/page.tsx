import Link from "next/link";
import { Logo } from "@/components/logo";
import { ResetForm } from "./reset-form";

export const metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; token?: string }>;
}) {
  const { uid, token } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo light />
        </div>
        <div className="card p-8">
          {uid && token ? (
            <ResetForm uid={uid} token={token} />
          ) : (
            <div className="text-center">
              <h1 className="text-xl font-semibold text-brand-900">
                Invalid reset link
              </h1>
              <p className="mt-2 text-sm text-brand-800/70">
                This link is missing information. Please request a new one.
              </p>
              <Link href="/forgot-password" className="btn-primary mt-6 inline-flex">
                Request a new link
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
