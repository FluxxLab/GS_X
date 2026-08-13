import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config. Kept minimal: no incremental (ISR/data)
 * cache is configured, because this is a client-rendered dashboard (RSC
 * shells + React Query to the backend), so there's little ISR to cache and
 * static assets are already edge-cached by Cloudflare.
 *
 * To enable an ISR/data cache later: create an R2 bucket, bind it as
 * NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc, and pass `incrementalCache:
 * r2IncrementalCache` here (import from
 * "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache").
 */
const config = defineCloudflareConfig();

/**
 * Pin the inner Next build to webpack.
 *
 * Next 16 builds with Turbopack by default, but the OpenNext Cloudflare
 * adapter cannot run Turbopack production output — the build succeeds and
 * then every server route 500s at runtime (opennextjs-cloudflare#569).
 * `--webpack` keeps the deploy build on the supported bundler; local dev
 * and CI's `build:next` stay on Turbopack.
 *
 * Also breaks the pnpm recursion loop: Cloudflare runs `pnpm run build`,
 * which calls `opennextjs-cloudflare build`, whose default inner step would
 * call `pnpm build` again forever.
 */
export default { ...config, buildCommand: "next build --webpack" };
