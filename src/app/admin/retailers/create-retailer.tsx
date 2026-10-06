"use client";

import { useActionState, useState } from "react";
import { UserPlus, Loader2, Copy, Check } from "lucide-react";
import { createRetailer } from "./actions";

export function CreateRetailer() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createRetailer, null);
  const [copied, setCopied] = useState(false);

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" /> Add retailer
      </button>
    );
  }

  return (
    <div className="card w-full max-w-xl p-6">
      <h3 className="mb-4 font-semibold text-brand-900">New retailer account</h3>

      {state?.ok && state.tempPassword ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="text-sm text-brand-800">
            {state.message} We emailed their login. Temporary password:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded bg-white px-3 py-1.5 font-mono text-sm">
              {state.tempPassword}
            </code>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(state.tempPassword!);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="btn-ghost text-xs"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button onClick={() => setOpen(false)} className="btn-outline mt-4 text-sm">
            Done
          </button>
        </div>
      ) : (
        <form action={action} className="space-y-4">
          {state && !state.ok && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.message}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="businessName">Business name</label>
              <input id="businessName" name="businessName" className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="contactName">Contact name</label>
              <input id="contactName" name="contactName" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" required />
            </div>
            <div>
              <label className="label" htmlFor="discount">Account discount % (optional)</label>
              <input id="discount" name="discount" className="input" placeholder="e.g. 40 — overrides tiers" inputMode="numeric" />
            </div>
          </div>
          <p className="text-xs text-brand-800/50">
            Leave the discount blank to use the standard volume tiers. A password
            is auto-generated and emailed if you leave it blank.
          </p>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create account
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
