import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function decodeHeader(value: string | null) {
  if (!value) return null;
  try { return decodeURIComponent(value); } catch { return value; }
}

function getDevice(ua: string) {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "태블릿";
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "모바일";
  return "PC";
}

function getOS(ua: string) {
  if (/Windows NT/i.test(ua)) return "Windows";
  if (/Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua)) return "macOS";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS";
  if (/Linux/i.test(ua)) return "Linux";
  return "기타";
}

function getBrowser(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  return "기타";
}

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return NextResponse.json({ ok: false }, { status: 503 });

    const body = await request.json().catch(() => ({}));
    const pagePath = typeof body.page_path === "string" ? body.page_path.slice(0, 500) : "/";
    if (!pagePath.startsWith("/") || pagePath.startsWith("/admin") || pagePath.startsWith("/api/")) {
      return NextResponse.json({ ok: true });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || null;
    const ua = request.headers.get("user-agent") || "";
    const visitorId = request.cookies.get("klb_visitor")?.value || randomUUID();
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

    const { error } = await db.from("visitor_logs").insert({
      visitor_id: visitorId,
      ip_address: ip,
      country: request.headers.get("x-vercel-ip-country"),
      region: decodeHeader(request.headers.get("x-vercel-ip-country-region")),
      city: decodeHeader(request.headers.get("x-vercel-ip-city")),
      device: getDevice(ua),
      operating_system: getOS(ua),
      browser: getBrowser(ua),
      user_agent: ua.slice(0, 1000),
      page_path: pagePath
    });
    if (error) {
      console.error("Visitor tracking insert failed:", error.message);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const { error: countError } = await db.rpc("record_page_view", { p_page_path: pagePath });
    if (countError) console.error("Page view count update failed:", countError.message);

    const response = NextResponse.json({ ok: true });
    if (!request.cookies.get("klb_visitor")) {
      response.cookies.set("klb_visitor", visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365
      });
    }
    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
