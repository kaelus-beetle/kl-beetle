import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getIp(request: NextRequest) {
  return request.headers.get("x-real-ip")
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "";
}
function getHash(ip: string) {
  return createHash("sha256").update(ip).digest("hex");
}
function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
}
export async function GET(request: NextRequest) {
  const ip = getIp(request);
  const db = getDb();
  if (!ip || !db) return NextResponse.json({ decision: null });
  const { data, error } = await db.rpc("get_location_consent", { p_ip_hash: getHash(ip) });
  if (error) {
    console.error("Location consent lookup failed:", error.message);
    return NextResponse.json({ decision: null }, { status: 200 });
  }
  return NextResponse.json({ decision: data === "granted" || data === "declined" ? data : null }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: NextRequest) {
  const ip = getIp(request);
  const db = getDb();
  const body = await request.json().catch(() => ({}));
  const decision = body.decision;
  if (!ip || !db || (decision !== "granted" && decision !== "declined")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { error } = await db.rpc("set_location_consent", { p_ip_hash: getHash(ip), p_decision: decision });
  if (error) {
    console.error("Location consent save failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
