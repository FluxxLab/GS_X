import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config. Kept minimal: no incremental (ISR/data)
 * cache is configured, because the ERP is a client-rendered dashboard (RSC
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
 * Pin the inner Next build to `next build`.
 *
 * Cloudflare's Workers Builds pipeline runs `pnpm run build`, which we point at
 * `opennextjs-cloudflare build` so it produces the `.open-next/` output the
 * deploy step needs. That adapter, under pnpm, otherwise defaults its own build
 * step to `pnpm build`, which would call this same script again and recurse
 * forever. Pinning it to the raw Next build breaks that loop: the adapter
 * compiles the app once, then bundles it into `.open-next/`.
 */
export default { ...config, buildCommand: "next build" };
