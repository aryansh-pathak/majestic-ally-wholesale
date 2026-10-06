import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

// Edge-safe auth (no DB/bcrypt). Reads the signed JWT session cookie.
const { auth } = NextAuth(authConfig);

// Routes that require a logged-in retailer OR owner.
const PROTECTED = ["/catalog", "/account", "/checkout", "/cart"];
// Routes that require the owner role specifically.
const OWNER_ONLY = ["/admin"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const role = req.auth?.user?.role;

  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  const needsOwner = OWNER_ONLY.some((p) => pathname.startsWith(p));

  if (needsOwner) {
    if (!isLoggedIn) {
      const url = new URL("/login", req.nextUrl);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (role !== "owner") {
      return NextResponse.redirect(new URL("/catalog", req.nextUrl));
    }
  }

  if (needsAuth && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  // Run on everything except static assets and the auth API.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
