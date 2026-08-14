import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/overview", "/sessions", "/delegates", "/live-ops", "/trivia", "/announce", "/security", "/discussions"]

export function middleware(req: NextRequest){
    const {pathname} = req.nextUrl;

    if (PROTECTED.some((p) => pathname.startsWith(p)) && !req.cookies.get("gs26_refresh")) {

        return NextResponse.redirect(new URL("/signin", req.url));
    }
    return NextResponse.next();
}

export const config = {
      matcher: [
    "/overview/:path*",
    "/sessions/:path*",
    "/delegates/:path*",
    "/live-ops/:path*",
    "/trivia/:path*",
    "/announce/:path*",
    "/security/:path*",
    "/discussions/:path*",
  ],
    } 