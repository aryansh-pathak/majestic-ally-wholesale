"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { requestReset, type ForgotState } from "./actions";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(
    requestReset,
    { done: false }
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo light />
        </div>
        <div className="card p-8">
          {state.done ? (
            <div className="text-center">
              <MailCheck className="mx-auto h-10 w-10 text-brand-500" />
              <h1 className="mt-3 text-xl font-semibold text-brand-900">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-brand-800/70">
                If an account exists for that address, we&apos;ve sent a link to
                reset your password. It expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="btn-outline mt-6 inline-flex"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-brand-900">
                Forgot your password?
              </h1>
              <p className="mt-1 text-sm text-brand-800/70">
                Enter your email and we&apos;ll send a reset link.
              </p>
              <form action={action} className="mt-6 space-y-4">
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="input"
                    placeholder="you@yourstore.com"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={pending}
                >
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
