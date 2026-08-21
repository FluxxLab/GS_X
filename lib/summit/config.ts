/**
 * Public API origins, with in-code fallbacks on purpose.
 *
 * NEXT_PUBLIC_* values are inlined into the client bundle at BUILD time.
 * Cloudflare's runtime variables are injected into the Worker long after that,
 * so a build that runs without them ships an empty string, and the browser
 * silently talks to its own origin instead of the API. That is invisible for
 * anything going through the /api/gs26 proxy and fatal for socket.io, which
 * connects to the API host directly.
 *
 * Keep these in step with the fallbacks in next.config.ts, which bakes the
 * same origins into the CSP at build time.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://18-175-94-245.sslip.io/api/v1";

/** socket.io is mounted at the server root, outside the /api/v1 prefix. */
export const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
