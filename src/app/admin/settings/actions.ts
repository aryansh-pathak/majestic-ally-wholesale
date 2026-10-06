"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireOwner } from "@/lib/auth-helpers";
import { ensureSettingsRow } from "@/lib/settings";
import type { Tier } from "@/lib/pricing";

function toCents(v: FormDataEntryValue | null, fallback: number): number {
  const n = parseFloat(String(v ?? ""));
  return Number.isNaN(n) ? fallback : Math.round(n * 100);
}
function toInt(v: FormDataEntryValue | null, fallback: number): number {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isNaN(n) ? fallback : n;
}

export async function saveSettings(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  await requireOwner();
  await ensureSettingsRow();
  const db = await getDb();

  const whereWeSell = String(formData.get("whereWeSell") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const tiers: Tier[] = [
    { minCents: toCents(formData.get("tier1_min"), 15000), pct: toInt(formData.get("tier1_pct"), 15) },
    { minCents: toCents(formData.get("tier2_min"), 30000), pct: toInt(formData.get("tier2_pct"), 20) },
    { minCents: toCents(formData.get("tier3_min"), 50000), pct: toInt(formData.get("tier3_pct"), 40) },
  ].sort((a, b) => a.minCents - b.minCents);

  const notificationEmail = String(formData.get("notificationEmail") || "").trim();
  if (!notificationEmail) return { ok: false, error: "Notification email is required." };

  await db
    .update(schema.settings)
    .set({
      notificationEmail,
      emailFrom: String(formData.get("emailFrom") || "").trim() || null,
      heroHeadline: String(formData.get("heroHeadline") || "").trim() || null,
      heroSubtext: String(formData.get("heroSubtext") || "").trim() || null,
      storyMarkdown: String(formData.get("storyMarkdown") || "").trim() || null,
      whereWeSell,
      freeShipThresholdCents: toCents(formData.get("freeShipThreshold"), 15000),
      flatShippingCents: toCents(formData.get("flatShipping"), 1500),
      tiers,
      updatedAt: new Date(),
    })
    .where(eq(schema.settings.id, 1));

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/catalog");
  return { ok: true };
}
