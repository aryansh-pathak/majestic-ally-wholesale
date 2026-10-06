import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Returns the session or null. Safe to call in any server component. */
export async function getSession() {
  return auth();
}

/** Require any logged-in user (retailer or owner). Redirects to /login. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

/** Require the owner role. Redirects non-owners away. */
export async function requireOwner() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "owner") redirect("/catalog");
  return session;
}

export async function isOwner() {
  const session = await auth();
  return session?.user?.role === "owner";
}
