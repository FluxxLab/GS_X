"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";

/**
 * Catches render/data errors from any page inside (summit). Renders in the
 * content area — the sidebar layout stays mounted, so an operator can navigate
 * away from a broken page instead of losing the whole dashboard.
 */
export default function SummitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces in the browser console and Cloudflare's logs, so a crash during
    // the event leaves a trace to debug afterwards.
    console.error("Summit page error:", error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Something broke
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          This page failed to render. The rest of the dashboard still works — use the sidebar to
          carry on, or retry below.
        </p>
      </header>

      <div className="glass-card flex flex-col items-start gap-4 p-6">
        <p className="text-sm text-summit-cream">{error.message || "Unknown error"}</p>
        {error.digest && (
          <p className="text-[11px] text-summit-smoke">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-[20px] bg-summit-cerise px-4 py-2 text-sm text-white transition-opacity hover:opacity-90"
        >
          <RotateCw className="size-4" /> Try again
        </button>
      </div>
    </div>
  );
}
