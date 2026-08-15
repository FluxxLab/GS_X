import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const TIERS = ["standard", "vip", "vvip", "press", "admin"] as const;
export type Tier = (typeof TIERS)[number];
export const GRANTABLE_TIERS = ["standard", "vip", "vvip", "press"] as const;

export interface Delegate {
  id: string;
  email: string;
  name: string;
  accessTier: Tier;
  title: string | null;
  organisation: string | null;
  country: string | null;
  flagged: boolean;
  pendingReview: boolean;
  phone: string | null;
  tracks: string[];
  interests: string[];
  createdAt: string;
}

export interface RegistrationEntry {
  id: string;
  email: string | null;
  inviteCode: string | null;
  name: string | null;
  assignedTier: Tier;
  claimedAt: string | null;
  claimedByDelegateId: string | null;
  createdAt: string;
}

export interface DelegateFilters {
  search?: string;
  tier?: Tier | "";
  track?: string;
}

export function useDelegates(filters: DelegateFilters) {
  return useQuery({
    queryKey: ["delegates", filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.search) params.set("search", filters.search);
      if (filters.tier) params.set("tier", filters.tier);
      if (filters.track) params.set("track", filters.track);
      const qs = params.toString();
      return api<Delegate[]>(`/delegates${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: ["admins"],
    queryFn: () => api<Delegate[]>("/delegates/admins"),
  });
}

export function useSetAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin }: { id: string; admin: boolean }) =>
      api<Delegate>(`/delegates/${id}/admin`, {
        method: "PATCH",
        body: JSON.stringify({ admin }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      qc.invalidateQueries({ queryKey: ["delegates"] });
    },
  });
}


export function useSetTier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tier }: { id: string; tier: Tier }) =>
      api<Delegate>(`/delegates/${id}/tier`, { method: "PATCH", body: JSON.stringify({ tier }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegates"] }),
  });
}

export function useRegistrationList() {
  return useQuery({
    queryKey: ["registration-list"],
    queryFn: () => api<RegistrationEntry[]>("/delegates/registration-list"),
  });
}

export function useAddRegistrationEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email?: string; inviteCode?: string; name?: string; assignedTier: Tier }) =>
      api<RegistrationEntry>("/delegates/registration-list", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-list"] }),
  });
}

export function useUpdateRegistrationEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; email?: string; inviteCode?: string; name?: string; assignedTier?: Tier }) =>
      api<RegistrationEntry>(`/delegates/registration-list/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-list"] }),
  });
}

export function useDeleteRegistrationEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/delegates/registration-list/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["registration-list"] }),
  });
}

export async function downloadDelegatesCsv() {
  const res = await fetch("/api/gs26/delegates/export?format=csv");
  if (!res.ok) throw new Error("Export failed — are you signed in?");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "gs26-delegates.csv";
  a.click();
  URL.revokeObjectURL(url);
}
