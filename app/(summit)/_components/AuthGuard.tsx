"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client-side replacement for the old `middleware.ts` sign-in redirect.
 *
 * The console is a static export, so nothing runs on the server before a page
 * is delivered. On the first load of any summit page this asks the auth
 * Worker whether a refresh cookie exists (the browser cannot read httpOnly
 * cookies itself) and bounces to /signin if not. Children stay unmounted
 * until the answer arrives so an unauthenticated visitor never sees an empty
 * dashboard shell flash - the round trip is to the edge, not the API, so it
 * is imperceptible.
 *
 * Client-side navigations between summit pages do not remount the layout, so
 * this runs once per hard load, not once per page. Security is unchanged:
 * the redirect was only ever a convenience, the API refuses every
 * unauthenticated call regardless.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/gs26/auth/session")
      .then((r) => (r.ok ? r.json() : { authenticated: false }))
      .then((s: { authenticated: boolean }) => {
        if (cancelled) return;
        if (s.authenticated) setReady(true);
        else router.replace("/signin");
      })
      // Edge unreachable: let the page render and the API calls surface it.
      .catch(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [router]);

  return ready ? <>{children}</> : null;
}
