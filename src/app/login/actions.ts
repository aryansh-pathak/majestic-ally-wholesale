"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import { signIn } from "@/auth";
import { getDb, schema } from "@/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function authenticate(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/catalog";
  const email = String(formData.get("email") || "").toLowerCase().trim();

  // Throttle repeated attempts per IP.
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return { error: "Too many attempts. Please wait a minute and try again." };
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        return { error: "Incorrect email or password." };
      }
      return { error: "Unable to sign in. Please try again." };
    }
    throw error;
  }

  // Signed in — send owners to the admin, retailers to their destination.
  const db = await getDb();
  const rows = await db
    .select({ role: schema.users.role })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  const dest = rows[0]?.role === "owner" ? "/admin" : callbackUrl;
  redirect(dest);
}
