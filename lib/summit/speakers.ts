import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface Speaker {
  id: string;
  name: string;
  role: string | null;
  organisation: string | null;
  avatarUrl: string | null;
}

export interface SpeakerInput {
  name: string;
  role?: string;
  organisation?: string;
}

export function useSpeakers() {
  return useQuery({
    queryKey: ["speakers"],
    queryFn: () => api<Speaker[]>("/speakers"),
    staleTime: 5 * 60_000, // speakers change rarely; don't refetch on every form open
  });
}

export function useCreateSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SpeakerInput) =>
      api<Speaker>("/speakers", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["speakers"] }),
  });
}
