"use client";

import dynamic from "next/dynamic";

/**
 * Client-only, deliberately.
 *
 * This page pulls in livekit-client and socket.io-client. Even though the
 * component is "use client", Next still evaluates that module graph on the
 * server to produce the initial HTML - and on Cloudflare Workers' free tier
 * that blew the 10ms CPU budget, so /capture returned Error 1102 while every
 * other route rendered fine.
 *
 * ssr: false keeps those libraries out of the Worker entirely. Nothing is lost:
 * a live microphone capture page has nothing to render server-side.
 *
 * The wrapper is itself "use client" because the App Router rejects ssr: false
 * inside a Server Component. It stays tiny - the heavy imports are deferred to
 * the browser by the dynamic() call below.
 */
const CaptureClient = dynamic(() => import("./CaptureClient"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-sm text-summit-smoke">Loading capture…</div>
  ),
});

export default function CapturePage() {
  return <CaptureClient />;
}
