import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe base config. Contains NO database or bcrypt imports so it can run
 * in middleware (edge runtime). The full config in auth.ts adds the Credentials
 * provider which does the DB lookup in the Node runtime.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [], // added in auth.ts
  callbacks: {
    // Copy role/status onto the JWT at sign-in so we never hit the DB to check
    // authorization on every request.
    jwt({ token, user }) {
      if (user) {
        // @ts-expect-error custom fields from authorize()
        token.role = user.role;
        // @ts-expect-error custom fields from authorize()
        token.status = user.status;
        // @ts-expect-error custom fields from authorize()
        token.businessName = user.businessName ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // @ts-expect-error augmented
        session.user.role = token.role;
        // @ts-expect-error augmented
        session.user.status = token.status;
        // @ts-expect-error augmented
        session.user.businessName = token.businessName ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
