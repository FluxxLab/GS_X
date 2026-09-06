"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMe } from "@/lib/summit/delegates";

/**
 * Session admins (caption operators) get the Capture tab and nothing else.
 * The API already refuses them everywhere else with a 403; this keeps them
 * from ever landing on a page full of those. Full admins pass straight
 * through, and so does anyone whose profile has not loaded yet - a slow
 * profile must not lock an admin out of their own console.
 */
export const SESSION_ADMIN_HOME = "/capture";

export default function RoleGate({ children }: { children: React.ReactNode }) {
  const { data: me } = useMe();
  const pathname = usePathname();
  const router = useRouter();
  const restricted = me?.accessTier === "session_admin" && !pathname.startsWith(SESSION_ADMIN_HOME);

  useEffect(() => {
    if (restricted) router.replace(SESSION_ADMIN_HOME);
  }, [restricted, router]);

  return restricted ? null : <>{children}</>;
}
