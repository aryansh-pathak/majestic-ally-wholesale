"use server";

import { z } from "zod";
import { getDb, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { sendMail, emailLayout } from "@/lib/email";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const leadSchema = z.object({
  businessName: z.string().min(2, "Business name is required").max(200),
  contactName: z.string().min(2, "Contact name is required").max(200),
  email: z.string().email("Enter a valid email").max(200),
  phone: z.string().max(50).optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  businessType: z.string().max(100).optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  message: z.string().max(2000).optional().or(z.literal("")),
  // Honeypot — bots fill this, humans don't see it.
  company_url: z.string().max(0).optional().or(z.literal("")),
});

export type LeadState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function submitLead(
  _prev: LeadState,
  formData: FormData
): Promise<LeadState> {
  const ip = await clientIp();
  if (!rateLimit(`lead:${ip}`, 5, 60_000)) {
    return { ok: false, error: "Too many submissions. Please wait a moment and try again." };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = leadSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const data = parsed.data;

  // Honeypot triggered — silently accept so bots don't learn anything.
  if (data.company_url && data.company_url.length > 0) {
    return { ok: true };
  }

  try {
    const db = await getDb();
    await db.insert(schema.leads).values({
      businessName: data.businessName,
      contactName: data.contactName,
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      website: data.website || null,
      businessType: data.businessType || null,
      location: data.location || null,
      message: data.message || null,
    });

    const settings = await getSettings();
    const rows = (
      [
        ["Business", data.businessName],
        ["Contact", data.contactName],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Website", data.website],
        ["Business type", data.businessType],
        ["Location", data.location],
        ["Message", data.message],
      ] as [string, string | undefined][]
    )
      .filter(([, v]) => v)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 12px 6px 0;color:#7c5227;font-weight:600;vertical-align:top;">${k}</td><td style="padding:6px 0;">${escapeHtml(
            v as string
          )}</td></tr>`
      )
      .join("");

    await sendMail({
      to: settings.notificationEmail,
      from: settings.emailFrom,
      replyTo: data.email,
      subject: `New wholesale inquiry — ${data.businessName}`,
      html: emailLayout(
        "New wholesale account inquiry",
        `<table style="border-collapse:collapse;font-size:14px;">${rows}</table>
         <p style="margin-top:16px;color:#7c5227;">Reply directly to this email to reach ${escapeHtml(
           data.contactName
         )}.</p>`
      ),
    });

    return { ok: true };
  } catch (err) {
    console.error("[submitLead] failed:", err);
    return {
      ok: false,
      error:
        "Something went wrong saving your inquiry. Please try again or email info@majesticallyproducts.com.",
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
