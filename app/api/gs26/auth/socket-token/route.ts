import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOpts,
  refreshWithBackend,
} from "@/lib/summit/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  if (token) return NextResponse.json({ token });

  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const rotated = await refreshWithBackend(refreshToken);
  if (!rotated) {
    const res = NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    res.cookies.delete(ACCESS_COOKIE);
    res.cookies.delete(REFRESH_COOKIE);
    return res;
  }

  const res = NextResponse.json({ token: rotated.access });
  res.cookies.set(ACCESS_COOKIE, rotated.access, cookieOpts(60 * 60));
  res.cookies.set(REFRESH_COOKIE, rotated.refresh, cookieOpts(60 * 60 * 24 * 7));
  return res;
}
