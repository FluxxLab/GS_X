import { NextRequest, NextResponse } from "next/server";
import {
  BASE,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  cookieOpts,
  refreshWithBackend,
} from "@/lib/summit/server";

async function forward(req: NextRequest, path: string[], body: string | undefined, token?: string){
    return fetch(`${BASE}/${path.join("/")}${req.nextUrl.search}`,{
        method: req.method,
        headers:{
            "Content-Type": "application/json",
            ...(token ? {Authorization: `Bearer ${token}`} : {})
        },
        body,
    });
}

async function handle(req: NextRequest, ctx: {params: Promise<{path: string[]}>}){
    const {path} = await ctx.params;
    const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.text();

    let rotated: {access: string; refresh: string} | null = null;

    let upstream = await forward(req, path, body, req.cookies.get(ACCESS_COOKIE)?.value);

    if(upstream.status === 401){
        const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
        if(refreshToken){
            rotated = await refreshWithBackend(refreshToken);
            if(rotated) upstream = await forward(req, path,body, rotated.access);
        }
    }

    const text = await upstream.text();
    const res = new NextResponse(text,{
        status: upstream.status,
        headers: {"Content-Type": upstream.headers.get("Content-Type") ?? "application/json"},
    });

    if(rotated){
        res.cookies.set(ACCESS_COOKIE, rotated.access, cookieOpts(60 * 5));
        res.cookies.set(REFRESH_COOKIE, rotated.refresh, cookieOpts(60 * 5));
    } else if(upstream.status === 401){
        res.cookies.delete(ACCESS_COOKIE);
        res.cookies.delete(REFRESH_COOKIE);

    }
    return res;
}

export {handle as GET, handle as POST, handle as PUT, handle as DELETE};