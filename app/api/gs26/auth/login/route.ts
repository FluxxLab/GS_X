import { NextRequest, NextResponse } from "next/server";
import {BASE, ACCESS_COOKIE, REFRESH_COOKIE, cookieOpts, extractTokens} from "@/lib/summit/server";

export async function POST(req: NextRequest){
    const creds = await req.json();
    const upstream = await fetch(`${BASE}/auth/login`,{
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(creds),
    });

    const data = await upstream.json().catch(() => null);


    if(!upstream.ok){
        const msg = Array.isArray(data?.message) ? data.message.join(",") : (data?.message ?? "Unknown error");
        return NextResponse.json({error: msg}, {status: upstream.status});
    }

    const tokens = extractTokens(data);

    if(!tokens){
        return NextResponse.json({message: "Unexpected login response shape from API"}, {status: 502});
    }

const res = NextResponse.json({ok: true, user:data?.user ?? data?.data?.user ?? null});
res.cookies.set(ACCESS_COOKIE, tokens.access, cookieOpts(60 * 60));
res.cookies.set(REFRESH_COOKIE, tokens.refresh, cookieOpts(60 * 60 * 24 *7));
return res;

}