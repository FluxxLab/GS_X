/*
 * GS-26 admin console service worker.
 *
 * Deliberately conservative, because a misbehaving SW is worse than none:
 *  - It ONLY touches same-origin GET requests. The API lives on another origin,
 *    so every auth / data call passes straight through, untouched.
 *  - It NEVER caches page HTML. Navigations are network-first and fall back to a
 *    static offline page, so nothing authenticated is ever stored and a deploy
 *    can never serve a stale shell.
 *  - It caches only content-hashed static assets (/_next/static, images, fonts),
 *    which are immutable: a new build ships new URLs, so cache-first is safe.
 *
 * Bump CACHE_VERSION to force old caches out on the next activate.
 */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `gs26-static-${CACHE_VERSION}`;
const PRECACHE = [
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
];

const ASSET_EXT = /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.status === 200 && response.type === "basic") {
    const clone = response.clone();
    caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone)).catch(() => {});
  }
  return response;
}

async function navigateNetworkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    // Offline (or the request timed out): show the branded offline page rather
    // than the browser's default error. We never serve a cached authed shell.
    return (await caches.match("/offline.html")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Same-origin only. The API and any third-party host pass straight through.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(navigateNetworkFirst(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || ASSET_EXT.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});
