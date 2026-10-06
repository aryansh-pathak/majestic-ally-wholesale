import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { typeahead } from "@/lib/catalog";

// Typeahead endpoint. Gated: only authenticated users get results.
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").slice(0, 100);
  if (!q.trim()) return NextResponse.json({ hits: [] });

  const hits = await typeahead(q, 8);
  return NextResponse.json({ hits });
}
