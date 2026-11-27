import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  // Vercel supplies the visitor country. Block known non-Korean countries.
  if (process.env.VERCEL && country !== "KR" && !request.nextUrl.pathname.startsWith("/country-blocked")) {
    return NextResponse.rewrite(new URL("/country-blocked", request.url), { status: 403 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
