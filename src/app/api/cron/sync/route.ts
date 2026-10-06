import { NextResponse } from "next/server";
import { syncFromShopify, isShopifyConfigured } from "@/lib/shopify";

// Nightly Shopify sync, triggered by Vercel Cron (see vercel.json).
// Protected by CRON_SECRET so it can't be run by the public.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const provided = auth?.replace("Bearer ", "") || url.searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isShopifyConfigured()) {
    return NextResponse.json({ error: "shopify not configured" }, { status: 400 });
  }

  try {
    const result = await syncFromShopify();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
