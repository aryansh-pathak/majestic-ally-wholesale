"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { saveSettings } from "./actions";
import type { AppSettings } from "@/lib/settings";

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const d = (c: number) => (c / 100).toFixed(2);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          setError(null);
          const res = await saveSettings(fd);
          if (res.ok) {
            setSaved(true);
            router.refresh();
            setTimeout(() => setSaved(false), 2500);
          } else setError(res.error || "Could not save.");
        });
      }}
      className="max-w-3xl space-y-6"
    >
      {/* Notifications */}
      <Section title="Notifications & email">
        <Field label="Where new inquiries & orders are emailed" name="notificationEmail" defaultValue={settings.notificationEmail} />
        <Field label="“From” address for outgoing email" name="emailFrom" defaultValue={settings.emailFrom} hint="Must be a domain verified in Resend." />
      </Section>

      {/* Brand copy */}
      <Section title="Public site copy">
        <Field label="Hero headline" name="heroHeadline" defaultValue={settings.heroHeadline} />
        <Area label="Hero subtext" name="heroSubtext" defaultValue={settings.heroSubtext} rows={2} />
        <Area label="Our story" name="storyMarkdown" defaultValue={settings.storyMarkdown} rows={4} />
        <Area
          label="Where we sell (one per line)"
          name="whereWeSell"
          defaultValue={settings.whereWeSell.join("\n")}
          rows={4}
        />
      </Section>

      {/* Pricing tiers */}
      <Section title="Wholesale pricing tiers">
        <p className="text-xs text-brand-800/50">
          Discount applied to the whole order based on its MSRP subtotal.
        </p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tier {i + 1} — order at least ($)</label>
              <input name={`tier${i + 1}_min`} defaultValue={d(settings.tiers[i]?.minCents ?? 0)} className="input" inputMode="decimal" />
            </div>
            <div>
              <label className="label">Discount (%)</label>
              <input name={`tier${i + 1}_pct`} defaultValue={String(settings.tiers[i]?.pct ?? 0)} className="input" inputMode="numeric" />
            </div>
          </div>
        ))}
      </Section>

      {/* Shipping */}
      <Section title="Shipping">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Free shipping at ($)" name="freeShipThreshold" defaultValue={d(settings.freeShipThresholdCents)} />
          <Field label="Flat shipping below threshold ($)" name="flatShipping" defaultValue={d(settings.flatShippingCents)} />
        </div>
      </Section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-0 flex items-center gap-3 border-t border-brand-100 bg-cream/90 py-3 backdrop-blur">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null}
          {saved ? "Saved" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h2 className="mb-4 font-semibold text-brand-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Field({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue?: string | null; hint?: string }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue ?? ""} className="input" />
      {hint && <p className="mt-1 text-xs text-brand-800/50">{hint}</p>}
    </div>
  );
}
function Area({ label, name, defaultValue, rows }: { label: string; name: string; defaultValue?: string | null; rows: number }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <textarea id={name} name={name} defaultValue={defaultValue ?? ""} rows={rows} className="input" />
    </div>
  );
}
