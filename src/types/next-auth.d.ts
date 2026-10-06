import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "owner" | "retailer";
      status: "active" | "disabled";
      businessName?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "owner" | "retailer";
    status?: "active" | "disabled";
    businessName?: string | null;
  }
}
