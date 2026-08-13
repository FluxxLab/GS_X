// Deployment note: main carries the current release (ERP polish, guided tour
// v3 with nav-derived tips, S3-backed product catalog images). Merged from
// feature/testimonials for deployment.
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Enables `getCloudflareContext()` (env/bindings) during `next dev` / wrangler
// dev. No-op in a normal `next build` / production, so it's safe here.
initOpenNextCloudflareForDev();

const isDev = process.env.NODE_ENV !== "production";

// The backend API is a separate origin (different host/port), so it must be
// explicitly allow-listed in connect-src / img-src or every fetch and
// backend-served image (avatars, uploads under /public) is blocked by the CSP.
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
let apiOrigin = apiUrl;
/** Same origin, in the shape next/image's remotePatterns wants. */
let apiImageHost: { protocol: "http" | "https"; hostname: string; port?: string } | null = null;
try {
  const parsed = new URL(apiUrl);
  apiOrigin = parsed.origin;
  apiImageHost = {
    protocol: parsed.protocol === "https:" ? "https" : "http",
    hostname: parsed.hostname,
    ...(parsed.port ? { port: parsed.port } : {}),
  };
} catch {
  // leave the raw value if it isn't a parseable URL
}

/**
 * Content-Security-Policy. helmet covers the API responses; this is the
 * defence-in-depth layer for the Next-served HTML and assets.
 *
 * script/style use 'unsafe-inline' because Next's App Router injects inline
 * hydration scripts and Tailwind injects inline styles; without a nonce-based
 * setup (a middleware change) that's the pragmatic baseline. It still blocks
 * the high-value attacks: external/injected script sources, clickjacking
 * (frame-ancestors), base-tag hijacking, and form exfiltration. Dev loosens
 * script-src/connect-src for Turbopack HMR (eval + websocket).
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  `style-src 'self' 'unsafe-inline'`,
  // i.ytimg.com serves the poster frame for the marketing site's YouTube embed.
  `img-src 'self' data: blob: https://i.ytimg.com ${apiOrigin}`,
  
  `font-src 'self' data:`,
    `connect-src 'self' ${apiOrigin} ${apiOrigin.replace(/^http/, "ws")}${isDev ? " ws: wss:" : ""}`,

  // Without this, default-src 'self' refuses the YouTube player outright.
  // Scoped to the one host that needs it, and to the -nocookie origin: the
  // player is only framed, never scripted by us, so script-src stays untouched.
  `frame-src 'self' https://www.youtube-nocookie.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  ...(isDev ? [] : [`upgrade-insecure-requests`]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
      value: "camera=(), microphone=(self), geolocation=()",

  },
  // HSTS only matters over HTTPS; harmless on http://localhost in dev but only
  // emit it in production to avoid pinning a dev machine to HTTPS.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  // A stray pnpm-lock.yaml higher up (~/Downloads) makes Next guess the wrong
  // workspace root; pin it to this project explicitly.
  turbopack: { root: __dirname },

  // jspdf / xlsx are browser-only and only run inside client click handlers.
  // Keep them out of the server bundle so their Node-only worker code
  // (fflate `new Worker`) doesn't break the Turbopack SSR build.
  serverExternalPackages: ["jspdf", "jspdf-autotable", "xlsx"],

   images: {
    unoptimized: true,
  },


  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
