import Link from "next/link";
import { requireOwner } from "@/lib/auth-helpers";
import { Logo } from "@/components/logo";
import { signOutAction } from "@/app/actions/session";
import { AdminNav } from "./admin-nav";
import { LogOut } from "lucide-react";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireOwner();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[1400px] flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="border-b border-brand-100 bg-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-4">
            <Logo href="/admin" />
          </div>
          <div className="px-3 pb-4">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-brand-800/40">
              Owner admin
            </div>
            <AdminNav />
          </div>
          <div className="mt-auto border-t border-brand-100 px-5 py-4">
            <div className="mb-2 text-xs text-brand-800/50">
              {session.user.email}
            </div>
            <form action={signOutAction}>
              <button className="flex items-center gap-2 text-sm text-brand-800/70 hover:text-brand-900">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
