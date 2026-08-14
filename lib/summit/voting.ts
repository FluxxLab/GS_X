import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Track } from "./sessions";

export interface PitchEntry {
  id: string;
  innovatorName: string;
  country: string;
  track: Track;
  description: string;
  voteCount: number;
  createdAt: string;
}

export interface PitchEntryInput {
  innovatorName: string;
  country: string;
  track: Track;
  description: string;
}

/**  Query key is ["voting"] on purpose: RealtimeRefresher already invalidates
/* that key on the `voting:tally` socket event, so the leaderboard is live
/* without any socket code in this feature.
*/
export function usePitchEntries() {
  return useQuery({
    queryKey: ["voting"],
    queryFn: () => api<PitchEntry[]>("/voting/entries"),
    refetchInterval: 20_000,
  });
}

export function useCreatePitchEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PitchEntryInput) =>
      api<PitchEntry>("/voting/entries", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}
