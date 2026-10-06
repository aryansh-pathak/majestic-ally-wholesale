"use server";

import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getSettings } from "@/lib/settings";
import { sendMail, emailLayout } from "@/lib/email";
import { makeToken } from "@/lib/tokens";

const schemaEmail = z.object({ email: z.string().email() });

export type ForgotState = { done: boolean; error?: string };

export async function requestReset(
  _prev: ForgotState,
  formData: FormData
): Promise<ForgotState> {
  const parsed = schemaEmail.safeParse({ email: formData.get("email") });
  // Always show the same message to avoid revealing which emails exist.
  const generic: ForgotState = { done: true };
  if (!parsed.success) return generic;

  const email = parsed.data.email.toLowerCase().trim();

  try {
    const db = await getDb();
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    const user = users[0];
    if (!user || user.status !== "active") return generic;

    // Clean up expired tokens for tidiness.
    await db
      .delete(schema.passwordResetTokens)
      .where(lt(schema.passwordResetTokens.expiresAt, new Date()));

    const { raw, hash } = makeToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.insert(schema.passwordResetTokens).values({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    });

    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const link = `${base}/reset-password?uid=${user.id}&token=${raw}`;
    const settings = await getSettings();

    await sendMail({
      to: user.email,
      from: settings.emailFrom,
      subject: "Reset your Majestic Ally Wholesale password",
      html: emailLayout(
        "Reset your password",
        `<p>We received a request to reset your password. This link expires in 1 hour.</p>
         <p style="margin:24px 0;"><a href="${link}" style="background:#1f3d2b;color:#faf7f1;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Set a new password</a></p>
         <p style="color:#7c5227;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>`
      ),
    });

    return generic;
  } catch (err) {
    console.error("[requestReset] failed:", err);
    return generic; // still generic — don't leak errors
  }
}

const resetSchema = z
  .object({
    uid: z.coerce.number().int().positive(),
    token: z.string().min(10),
    password: z.string().min(8, "Use at least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords don't match",
    path: ["confirm"],
  });

export type ResetState = { ok?: boolean; error?: string };

export async function performReset(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid request." };
  }
  const { uid, token, password } = parsed.data;

  try {
    const { hashToken } = await import("@/lib/tokens");
    const { hashPassword } = await import("@/lib/password");
    const db = await getDb();
    const tokenHash = hashToken(token);

    const rows = await db
      .select()
      .from(schema.passwordResetTokens)
      .where(
        and(
          eq(schema.passwordResetTokens.userId, uid),
          eq(schema.passwordResetTokens.tokenHash, tokenHash)
        )
      )
      .limit(1);
    const row = rows[0];
    if (!row || row.expiresAt < new Date()) {
      return { error: "This reset link is invalid or has expired." };
    }

    const passwordHash = await hashPassword(password);
    await db
      .update(schema.users)
      .set({ passwordHash })
      .where(eq(schema.users.id, uid));
    // Invalidate all reset tokens for this user.
    await db
      .delete(schema.passwordResetTokens)
      .where(eq(schema.passwordResetTokens.userId, uid));

    return { ok: true };
  } catch (err) {
    console.error("[performReset] failed:", err);
    return { error: "Something went wrong. Please request a new link." };
  }
}
