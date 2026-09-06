import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

/**
 * "session_admin" is staff, not a delegate tier as such: a caption operator
 * who sees the Capture tab and nothing else. It sits in the same list because
 * the API carries it in the same field.
 */
export const TIERS = ["standard", "vip", "vvip", "press", "admin", "session_admin"] as const;
export type StaffRole = "admin" | "session_admin";
export const isStaff = (tier: string | undefined): tier is StaffRole =>
  tier === "admin" || tier === "session_admin";
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

/**
 * Approval gate: a delegate with `pendingReview` sees a waiting screen in the
 * app instead of the summit. Approving clears it, and the app is told over the
 * delegate's own socket room so the wait ends without a restart.
 */
export function useSetApproval() {
  const qc = useQueryClient();
  return useMutation<Delegate, Error, { id: string; approved: boolean }>({
    mutationFn: ({ id, approved }) =>
      api<Delegate>(`/delegates/${id}/approval`, {
        method: "PATCH",
        body: JSON.stringify({ approved }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegates"] }),
  });
}

/** Approve everyone still waiting. Returns how many were let in. */
export function useApproveAll() {
  const qc = useQueryClient();
  return useMutation<{ approved: number }, Error, void>({
    mutationFn: () => api<{ approved: number }>("/delegates/approve-all", { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["delegates"] }),
  });
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

/** The signed-in operator. What they may see in the console hangs on `accessTier`. */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<Delegate>("/delegates/me"),
    staleTime: 5 * 60_000,
  });
}

/**
 * Grant or revoke staff access. `role` picks what is granted: "admin" (the
 * whole console) or "session_admin" (Capture only). Revoking needs no role;
 * either kind goes back to a standard delegate.
 */
export function useSetAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, admin, role }: { id: string; admin: boolean; role?: StaffRole }) =>
      api<Delegate>(`/delegates/${id}/admin`, {
        method: "PATCH",
        body: JSON.stringify(role ? { admin, role } : { admin }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admins"] });
      qc.invalidateQueries({ queryKey: ["delegates"] });
      qc.invalidateQueries({ queryKey: ["me"] });
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
