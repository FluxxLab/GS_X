export const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
export const ACCESS_COOKIE = "gs26_access";
export const REFRESH_COOKIE = "gs26_refresh";

export function cookieOpts(maxAgeSeconds: number){
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        path: '/',
        maxAge: maxAgeSeconds,
    };
}


export function extractTokens(raw: unknown ): {access: string; refresh: string;} | null{
 const r = (raw as {data?: Record<string, never>})?.data ?? (raw as Record<string, never>);

 if(!r || typeof r !== "object"){
    return null;
 }
    const anyR = r as Record<string, undefined> & {
        tokens?: {accessToken?: string; refreshToken?: string};
    };
    const access = anyR.accessToken ?? anyR.access_token ?? anyR.tokens?.accessToken;
    const refresh = anyR.refreshToken ?? anyR.refresh_token ?? anyR.tokens?.refreshToken;
    return access && refresh ? {access, refresh} : null;
 }



 export async function refreshWithBackend(refreshToken: string) {
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return extractTokens(data) ?? null;
}


