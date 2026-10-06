"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { authenticate, type LoginState } from "./actions";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    authenticate,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      {state.error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </div>
      )}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="input"
          placeholder="you@yourstore.com"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-brand-600 hover:text-brand-800"
          >
            Forgot?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
