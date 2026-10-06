import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { getDb, schema } from "./db";
import { verifyPassword } from "./lib/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const db = await getDb();
        const rows = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email.toLowerCase().trim()))
          .limit(1);
        const user = rows[0];
        if (!user) return null;
        if (user.status !== "active") return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name ?? user.businessName ?? user.email,
          // custom fields flow into the jwt callback
          role: user.role,
          status: user.status,
          businessName: user.businessName,
        } as unknown as { id: string; email: string; name: string };
      },
    }),
  ],
});
