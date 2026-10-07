"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { requireOwner } from "@/lib/auth-helpers";
import { hashPassword } from "@/lib/password";
import { getSettings } from "@/lib/settings";
import { sendMail, emailLayout } from "@/lib/email";

function genPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  const bytes = crypto.randomBytes(8);
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length];
  return `Ally-${s}`;
}

const createSchema = z.object({
  email: z.string().email(),
  businessName: z.string().min(1).max(200),
  contactName: z.string().max(200).optional().or(z.literal("")),
  password: z.string().max(200).optional().or(z.literal("")),
  discount: z.string().optional().or(z.literal("")),
});

export async function createRetailer(
  _prev: { ok: boolean; message?: string; tempPassword?: string } | null,
  formData: FormData
): Promise<{ ok: boolean; message?: string; tempPassword?: string }> {
  await requireOwner();
  const parsed = createSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { ok: false, message: "Check the email and business name." };
  const d = parsed.data;
  const email = d.email.toLowerCase().trim();
  const db = await getDb();

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing[0]) return { ok: false, message: "An account with that email already exists." };

  const password = d.password && d.password.length >= 8 ? d.password : genPassword();
  const discount = d.discount && d.discount !== "" ? Math.max(0, Math.min(100, parseInt(d.discount, 10))) : null;

  await db.insert(schema.users).values({
    email,
    passwordHash: await hashPassword(password),
    role: "retailer",
    status: "active",
    name: d.contactName || null,
    businessName: d.businessName,
    accountDiscountPct: Number.isNaN(discount as number) ? null : discount,
  });

  // Email the retailer their login (best-effort).
  const settings = await getSettings();
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  await sendMail({
    to: email,
    from: settings.emailFrom,
    subject: "Your Majestic Ally wholesale account is ready",
    html: emailLayout(
      "Welcome to Majestic Ally Wholesale",
      `<p>Your wholesale account is active. Sign in to browse the line and see your pricing:</p>
       <p><strong>Login:</strong> <a href="${base}/login">${base}/login</a></p>
       <p><strong>Email:</strong> ${email}<br><strong>Temporary password:</strong> ${password}</p>
       <p style="color:#7c5227;">Please change your password after your first sign-in (use “Forgot password”).</p>`
    ),
  });

  revalidatePath("/admin/retailers");
  return {
    ok: true,
    message: `Account created for ${d.businessName}.`,
    tempPassword: password,
  };
}

export async function setRetailerStatus(id: number, status: "active" | "disabled") {
  await requireOwner();
  const db = await getDb();
  await db.update(schema.users).set({ status }).where(eq(schema.users.id, id));
  revalidatePath("/admin/retailers");
  return { ok: true };
}

export async function resetRetailerPassword(id: number): Promise<{ ok: boolean; tempPassword?: string }> {
  await requireOwner();
  const db = await getDb();
  const password = genPassword();
  await db.update(schema.users).set({ passwordHash: await hashPassword(password) }).where(eq(schema.users.id, id));
  revalidatePath("/admin/retailers");
  return { ok: true, tempPassword: password };
}

export async function setAccountDiscount(id: number, pct: number | null) {
  await requireOwner();
  const db = await getDb();
  await db.update(schema.users).set({ accountDiscountPct: pct }).where(eq(schema.users.id, id));
  revalidatePath("/admin/retailers");
  return { ok: true };
}

/**
 * Permanently delete a retailer account and everything tied to it (their
 * orders + order items, password-reset tokens, 2FA secret). Owner accounts
 * are protected. This cannot be undone.
 */
export async function deleteRetailer(
  id: number
): Promise<{ ok: boolean; message?: string }> {
  await requireOwner();
  const db = await getDb();
  const rows = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  if (!rows[0]) return { ok: false, message: "Account not found." };
  if (rows[0].role === "owner")
    return { ok: false, message: "Owner accounts can't be deleted." };

  // Remove their orders first (order_items cascade on order delete); the
  // user's reset tokens and TOTP secret cascade when the user is deleted.
  await db.delete(schema.orders).where(eq(schema.orders.userId, id));
  await db.delete(schema.users).where(eq(schema.users.id, id));

  revalidatePath("/admin/retailers");
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  return { ok: true };
}
