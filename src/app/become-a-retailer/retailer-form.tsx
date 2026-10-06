"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { submitLead, type LeadState } from "./actions";

const initial: LeadState = { ok: false };

export function RetailerForm() {
  const [state, formAction, pending] = useActionState(submitLead, initial);

  if (state.ok) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-500" />
        <h2 className="mt-4 text-2xl font-semibold text-brand-900">
          Thanks — we&apos;ve got your inquiry.
        </h2>
        <p className="mt-2 text-brand-800/80">
          Our team will review your details and follow up, usually within a
          couple of business days. Questions in the meantime? Email{" "}
          <a
            className="font-medium text-brand-700 underline"
            href="mailto:info@majesticallyproducts.com"
          >
            info@majesticallyproducts.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card space-y-5 p-6 sm:p-8" noValidate>
      {state.error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Business name"
          name="businessName"
          required
          error={state.fieldErrors?.businessName}
        />
        <Field
          label="Contact name"
          name="contactName"
          required
          error={state.fieldErrors?.contactName}
        />
        <Field
          label="Email"
          name="email"
          type="email"
          required
          error={state.fieldErrors?.email}
        />
        <Field label="Phone" name="phone" type="tel" />
        <Field label="Website" name="website" placeholder="https://" />
        <div>
          <label className="label" htmlFor="businessType">
            Business type
          </label>
          <select id="businessType" name="businessType" className="input">
            <option value="">Select…</option>
            <option>Tack / equestrian retailer</option>
            <option>Pet store</option>
            <option>Farm & ranch / feed store</option>
            <option>Online reseller / marketplace</option>
            <option>Boutique / gift shop</option>
            <option>Distributor</option>
            <option>Other</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Field
            label="Location (city, state / country)"
            name="location"
            placeholder="Naperville, IL"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">
            Anything else? (optional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="input"
            placeholder="Tell us about your store, what lines you carry, and how you'd like to work with us."
          />
        </div>
      </div>

      {/* Honeypot — hidden from users, catches bots. */}
      <div className="hidden" aria-hidden>
        <label>
          Company URL
          <input name="company_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2">
        <p className="text-xs text-brand-800/60">
          Your details are private and used only to set up your wholesale
          account.
        </p>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? "Sending…" : "Submit application"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
        {required && <span className="text-saddle"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="input"
        aria-invalid={!!error}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
