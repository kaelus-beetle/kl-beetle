import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const visitorId = request.cookies.get("klb_visitor")?.value;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!visitorId || !url || !key) {
    return NextResponse.json({ hasConsent: false }, { headers: { "Cache-Control": "no-store" } });
  }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await db.rpc("has_location_consent", { p_visitor_id: visitorId });
  if (error) {
    console.error("Location consent lookup failed:", error.message);
    return NextResponse.json({ hasConsent: false }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json({ hasConsent: data === true }, { headers: { "Cache-Control": "no-store" } });
}
