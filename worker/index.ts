/**
 * The whole server side of the admin console, as one small Cloudflare Worker.
 *
 * The Next.js app is a static export (`output: "export"`) served from the
 * `out/` directory as Workers Static Assets. Serving assets does not invoke
 * this script at all, so the dashboard pages carry no CPU-time accounting.
 * Only `/api/gs26/*` reaches this code (see `run_worker_first` in
 * wrangler.jsonc), and each handler is a cookie read, one `fetch` to the
 * NestJS API, and a cookie write - a fraction of a millisecond of CPU, far
 * inside the Workers Free plan's 10 ms budget that the OpenNext server used
 * to blow through on cold hits (Cloudflare error 1102).
 *
 * Why a proxy exists at all: the browser must never hold the JWTs. They live
 * in httpOnly cookies scoped to this origin; the Worker attaches the access
 * token as a Bearer header on the way to the API and transparently rotates
 * both tokens through `/auth/refresh` when the API answers 401.
 */

interface Env {
  /** Origin + prefix of the NestJS API, e.g. https://host/api/v1 */
  API_BASE_URL?: string;
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const API_BASE_URL_FALLBACK = "https://18-175-94-245.sslip.io/api/v1";

const ACCESS_COOKIE = "gs26_access";
const REFRESH_COOKIE = "gs26_refresh";
const ACCESS_TTL = 60 * 60; // 1 h - matches the API's access-token life
const REFRESH_TTL = 60 * 60 * 24 * 7; // 7 d - matches the API's refresh row

/** `/api/gs26/<path>` on this origin maps to `<API_BASE_URL>/<path>`. */
const PROXY_PREFIX = "/api/gs26/";

// ---------------------------------------------------------------------------
// Cookies
// ---------------------------------------------------------------------------

function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get("Cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return undefined;
}

/**
 * Always `Secure`: the Worker only ever answers over HTTPS in production, and
 * browsers accept Secure cookies from http://localhost during `wrangler dev`.
 */
function setCookie(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

function clearCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

/**
 * `_headers` in the asset directory only decorates asset responses, never
 * Worker responses, so the API answers carry their own hardening headers.
 */
const API_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200, cookies: string[] = []): Response {
  const headers = new Headers({ "Content-Type": "application/json", ...API_HEADERS });
  for (const c of cookies) headers.append("Set-Cookie", c);
  return new Response(JSON.stringify(body), { status, headers });
}

// ---------------------------------------------------------------------------
// Backend calls
// ---------------------------------------------------------------------------

interface Tokens {
  access: string;
  refresh: string;
}

/**
 * The API has answered login/refresh in a few shapes over time (flat,
 * `data`-wrapped, `tokens`-nested, snake_case). Accept all of them so a
 * backend response tweak never silently logs everyone out.
 */
function extractTokens(raw: unknown): Tokens | null {
  const outer = raw as { data?: unknown } | null;
  const r = (outer && typeof outer === "object" && "data" in outer ? outer.data : raw) as
    | (Record<string, unknown> & { tokens?: { accessToken?: string; refreshToken?: string } })
    | null;
  if (!r || typeof r !== "object") return null;
  const access = (r.accessToken ?? r.access_token ?? r.tokens?.accessToken) as string | undefined;
  const refresh = (r.refreshToken ?? r.refresh_token ?? r.tokens?.refreshToken) as
    | string
    | undefined;
  return access && refresh ? { access, refresh } : null;
}

async function refreshWithBackend(base: string, refreshToken: string): Promise<Tokens | null> {
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return extractTokens(data);
}

function forward(
  base: string,
  request: Request,
  path: string,
  search: string,
  body: string | undefined,
  token?: string,
): Promise<Response> {
  return fetch(`${base}/${path}${search}`, {
    method: request.method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handleLogin(base: string, request: Request): Promise<Response> {
  const creds = await request.text();
  const upstream = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: creds,
  });
  const data = (await upstream.json().catch(() => null)) as
    | { message?: string | string[]; user?: unknown; data?: { user?: unknown } }
    | null;

  if (!upstream.ok) {
    const msg = Array.isArray(data?.message)
      ? data.message.join(",")
      : (data?.message ?? "Unknown error");
    return json({ error: msg, message: msg }, upstream.status);
  }

  const tokens = extractTokens(data);
  if (!tokens) {
    return json({ message: "Unexpected login response shape from API" }, 502);
  }

  return json({ ok: true, user: data?.user ?? data?.data?.user ?? null }, 200, [
    setCookie(ACCESS_COOKIE, tokens.access, ACCESS_TTL),
    setCookie(REFRESH_COOKIE, tokens.refresh, REFRESH_TTL),
  ]);
}

function handleLogout(): Response {
  return json({ ok: true }, 200, [clearCookie(ACCESS_COOKIE), clearCookie(REFRESH_COOKIE)]);
}

/**
 * Replaces the old Next middleware's "is there a refresh cookie?" check. The
 * browser cannot read httpOnly cookies, so the summit layout asks here on
 * load and bounces to /signin on `false`. No backend call: presence only,
 * exactly the semantics the middleware had.
 */
function handleSession(request: Request): Response {
  return json({ authenticated: Boolean(readCookie(request, REFRESH_COOKIE)) });
}

async function handleSocketToken(base: string, request: Request): Promise<Response> {
  const token = readCookie(request, ACCESS_COOKIE);
  if (token) return json({ token });

  const refreshToken = readCookie(request, REFRESH_COOKIE);
  if (!refreshToken) return json({ message: "Not authenticated" }, 401);

  const rotated = await refreshWithBackend(base, refreshToken);
  if (!rotated) {
    return json({ message: "Not authenticated" }, 401, [
      clearCookie(ACCESS_COOKIE),
      clearCookie(REFRESH_COOKIE),
    ]);
  }
  return json({ token: rotated.access }, 200, [
    setCookie(ACCESS_COOKIE, rotated.access, ACCESS_TTL),
    setCookie(REFRESH_COOKIE, rotated.refresh, REFRESH_TTL),
  ]);
}

async function handleProxy(base: string, request: Request, path: string): Promise<Response> {
  const { search } = new URL(request.url);
  const body =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  let rotated: Tokens | null = null;
  let upstream = await forward(base, request, path, search, body, readCookie(request, ACCESS_COOKIE));

  if (upstream.status === 401) {
    const refreshToken = readCookie(request, REFRESH_COOKIE);
    if (refreshToken) {
      rotated = await refreshWithBackend(base, refreshToken);
      if (rotated) upstream = await forward(base, request, path, search, body, rotated.access);
    }
  }

  // Stream the upstream body through untouched - no buffering, no re-encoding.
  const headers = new Headers({
    "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
    ...API_HEADERS,
  });
  const disposition = upstream.headers.get("Content-Disposition");
  if (disposition) headers.set("Content-Disposition", disposition);

  if (rotated) {
    headers.append("Set-Cookie", setCookie(ACCESS_COOKIE, rotated.access, ACCESS_TTL));
    headers.append("Set-Cookie", setCookie(REFRESH_COOKIE, rotated.refresh, REFRESH_TTL));
  } else if (upstream.status === 401) {
    headers.append("Set-Cookie", clearCookie(ACCESS_COOKIE));
    headers.append("Set-Cookie", clearCookie(REFRESH_COOKIE));
  }

  return new Response(upstream.body, { status: upstream.status, headers });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (!url.pathname.startsWith(PROXY_PREFIX)) {
      // Not an API call: hand over to the static export.
      return env.ASSETS.fetch(request);
    }

    const base = (env.API_BASE_URL || API_BASE_URL_FALLBACK).replace(/\/+$/, "");
    const path = url.pathname.slice(PROXY_PREFIX.length);

    switch (`${request.method} ${path}`) {
      case "POST auth/login":
        return handleLogin(base, request);
      case "POST auth/logout":
        return handleLogout();
      case "GET auth/session":
        return handleSession(request);
      case "GET auth/socket-token":
        return handleSocketToken(base, request);
      default:
        return handleProxy(base, request, path);
    }
  },
};

export default worker;
