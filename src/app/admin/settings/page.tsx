import { getSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-brand-900">Settings</h1>
      <p className="mb-6 text-sm text-brand-800/60">
        Edit your public copy, pricing tiers, shipping, and where notifications
        go — no code required.
      </p>
      <SettingsForm settings={settings} />
    </div>
  );
}
