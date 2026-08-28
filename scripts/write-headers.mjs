/**
 * Writes `out/_headers` after `next build`.
 *
 * A static export cannot carry `headers()` from next.config.ts, so the
 * security headers move to the Workers Static Assets `_headers` file. It is
 * generated rather than committed because the CSP embeds the API and LiveKit
 * origins, which come from the same build-time env vars as the client bundle
 * (NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_LIVEKIT_URL) - keeping one source of
 * truth for "which origins may the browser talk to".
 *
 * Applies to asset responses only; the auth Worker sets its own headers on
 * /api/gs26/* responses (see worker/index.ts).
 */
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "out");
if (!existsSync(OUT_DIR)) {
  console.error("write-headers: out/ not found - run `next build` first");
  process.exit(1);
}

// Fallbacks match lib/summit/config.ts on purpose - see the note there.
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://18-175-94-245.sslip.io/api/v1";
const livekitUrl =
  process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gender-summit-3yzvts9i.livekit.cloud";

let apiOrigin = apiUrl;
try {
  apiOrigin = new URL(apiUrl).origin;
} catch {
  // keep the raw value if it isn't a parseable URL
}

let livekitOrigins = "";
try {
  const { host } = new URL(livekitUrl);
  // wss for the signal socket, https for the cloud region/validate calls
  livekitOrigins = `wss://${host} https://${host}`;
} catch {
  // not configured; capture still runs captions-only
}

/**
 * Content-Security-Policy. helmet covers the API responses; this is the
 * defence-in-depth layer for the static HTML and assets.
 *
 * script/style use 'unsafe-inline' because Next's App Router injects inline
 * hydration scripts and Tailwind injects inline styles. It still blocks the
 * high-value attacks: external/injected script sources, clickjacking
 * (frame-ancestors), base-tag hijacking, and form exfiltration.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  // i.ytimg.com serves the poster frame for the marketing site's YouTube embed.
  `img-src 'self' data: blob: https://i.ytimg.com ${apiOrigin}`,
  `font-src 'self' data:`,
  `connect-src 'self' ${apiOrigin} ${apiOrigin.replace(/^http/, "ws")} ${livekitOrigins}`.trim(),
  // Without this, default-src 'self' refuses the YouTube player outright.
  `frame-src 'self' https://www.youtube-nocookie.com`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const headers = [
  ["Content-Security-Policy", csp],
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(self), geolocation=()"],
  ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
];

const file = ["/*", ...headers.map(([k, v]) => `  ${k}: ${v}`)].join("\n") + "\n";
writeFileSync(join(OUT_DIR, "_headers"), file);
console.log(`write-headers: wrote out/_headers (${headers.length} headers, api=${apiOrigin})`);
