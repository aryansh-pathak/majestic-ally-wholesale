"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { performReset, type ResetState } from "../forgot-password/actions";

export function ResetForm({ uid, token }: { uid: string; token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(
    performReset,
    {}
  );

  if (state.ok) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-brand-500" />
        <h1 className="mt-3 text-xl font-semibold text-brand-900">
          Password updated
        </h1>
        <p className="mt-2 text-sm text-brand-800/70">
          You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-flex">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-brand-900">
        Set a new password
      </h1>
      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="uid" value={uid} />
        <input type="hidden" name="token" value={token} />
        {state.error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            {state.error}
          </div>
        )}
        <div>
          <label className="label" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="input"
          />
        </div>
        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Update password
        </button>
      </form>
    </>
  );
}
