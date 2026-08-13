import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const SEVERITIES = ["info", "warning", "critical"] as const;
export type Severity = (typeof SEVERITIES)[number];

export interface SecurityEvent {
  id: string;
  type: string;
  description: string;
  actionId: string | null;
  severity: Severity;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export function useSecurityEvents(severity: Severity | "all") {
  return useQuery({
    queryKey: ["security-events", severity],
    queryFn: () => {
      const qs = severity === "all" ? "" : `?severity=${severity}`;
      return api<SecurityEvent[]>(`/security/events${qs}`);
    },
    refetchInterval: 15_000,
  });
}

export function useOlderEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ before, severity }: { before: string; severity: Severity | "all" }) => {
      const params = new URLSearchParams({ before });
      if (severity !== "all") params.set("severity", severity);
      return api<SecurityEvent[]>(`/security/events?${params}`);
    },
    onSuccess: (older, { severity }) => {
      qc.setQueryData<SecurityEvent[]>(["security-events", severity], (curr) => [
        ...(curr ?? []),
        ...older,
      ]);
    },
  });
}
