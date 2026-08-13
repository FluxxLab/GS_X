"use client";

import { useEffect, useState, type ReactNode } from "react";
import { employeeService } from "@/lib/services/employee.service";

interface Props {
  employeeId: string | null | undefined;
  alt: string;
  /** Shown while loading and when the employee has no photo (initials block). */
  fallback: ReactNode;
  className?: string;
}

/**
 * The employee's profile photo (the passport photograph uploaded during
 * onboarding). The image is fetched through the authenticated API — a plain
 * <img src> cannot send the bearer token — and rendered from an object URL.
 */
export function EmployeeAvatar({ employeeId, alt, fallback, className }: Props) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    let alive = true;
    let url: string | null = null;
    employeeService
      .getAvatarBlob(employeeId)
      .then((blob) => {
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      })
      .catch(() => {
        /* no photo yet — the fallback stays */
      });
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
      setSrc(null);
    };
  }, [employeeId]);

  if (!src) return <>{fallback}</>;
  // eslint-disable-next-line @next/next/no-img-element -- object URL, next/image cannot optimize it
  return <img src={src} alt={alt} className={className} />;
}
