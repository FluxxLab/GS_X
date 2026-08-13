import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface BroadcastFlags {
  cutToBreak: boolean;
  captionsOverlay: boolean;
  signLanguageOverlay: boolean;
}

export interface LiveOpsSession {
  id: string;
  title: string;
  room: string;
  viewers: number;
  captionListeners: number;
  capturing: boolean; // audio feed alive within the last 30s (Redis heartbeat)
}

export interface LiveOpsOverview {
  sessions: LiveOpsSession[];
  flags: BroadcastFlags;
}

export function useLiveOpsOverview(){
    return useQuery({
        queryKey: ["live-ops"],
        queryFn: () => api<LiveOpsOverview>("/live-ops/overview"),
        refetchInterval: 10_000,
    });
}

export function useCutToBreak(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (active: boolean) => 
            api<BroadcastFlags>("/live-ops/cut-to-break",{
                method: "POST",
                body: JSON.stringify({active}),
            }),
            onSuccess: () => qc.invalidateQueries({queryKey: ["live-ops"]}),
    });
}

export function useSetOverlays(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: {captions?: boolean; signLanguage?: boolean}) =>
            api<BroadcastFlags>("/live-ops/overlays",{
                method: "POST",
                body: JSON.stringify(input),
            }),
            onSuccess: () => qc.invalidateQueries({queryKey: ["live-ops"]}),
    });
}