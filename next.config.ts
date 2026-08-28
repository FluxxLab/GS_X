import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Where the auth Worker listens during local development (`pnpm dev:worker`).
 * `next dev` proxies /api/gs26/* there so the dashboard keeps HMR while the
 * cookie/token handling runs in the same code that ships to Cloudflare.
 */
const DEV_WORKER_URL = process.env.DEV_WORKER_URL || "http://127.0.0.1:8787";

/**
 * Static export in production. The console is entirely client-rendered (every
 * summit page is "use client" and talks to the API through React Query), so
 * nothing is lost by pre-rendering the shells at build time - and everything
 * is gained on Cloudflare: the `out/` directory is served as Workers Static
 * Assets, which never invokes a Worker and so has no CPU-time budget to exceed
 * (the OpenNext server used to trip the Free plan's 10 ms limit on cold hits -
 * error 1102).
 *
 * The three things a static export cannot carry moved out of Next:
 * - `middleware.ts` sign-in redirect -> app/(summit)/_components/AuthGuard.tsx
 * - `app/api/gs26/*` cookie/token proxy  -> worker/index.ts
 * - `headers()` / `redirects()`           -> out/_headers (scripts/write-headers.mjs)
 *                                            and public/_redirects
 *
 * In development `output` is left unset so `next dev` runs normally, and the
 * `rewrites()` below stand in for the Worker's routing (rewrites are not
 * allowed with `output: "export"`, hence the conditional).
 */
const nextConfig: NextConfig = {
  ...(isProd ? { output: "export" as const } : {}),

  // A stray pnpm-lock.yaml higher up (~/Downloads) makes Next guess the wrong
  // workspace root; pin it to this project explicitly.
  turbopack: { root: __dirname },

  // jspdf / xlsx are browser-only and only run inside client click handlers.
  // Keep them out of the pre-render bundle so their Node-only worker code
  // (fflate `new Worker`) doesn't break the build.
  serverExternalPackages: ["jspdf", "jspdf-autotable", "xlsx"],

  // Required for `output: "export"` (no image optimiser at request time), and
  // the app never needed one.
  images: {
    unoptimized: true,
  },

  ...(isProd
    ? {}
    : {
        async rewrites() {
          return [{ source: "/api/gs26/:path*", destination: `${DEV_WORKER_URL}/api/gs26/:path*` }];
        },
        async redirects() {
          return [{ source: "/", destination: "/overview", permanent: false }];
        },
      }),
};

export default nextConfig;
