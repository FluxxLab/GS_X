import { useQuery } from "@tanstack/react-query";
import { api } from "./api";

export interface AdminOverview {
  delegate: { total: number; vip: number; vvip: number; press: number; flagged: number };
  sessions: { live: number; scheduled: number; completed: number };
  streaming: number;
  viewersPerSession: { sessionsId: string; title: string; viewers: number }[];
  topPitches: {
    entry: {
      id: string;
      innovatorName: string;
      country: string;
      track: string;
      description: string;
    };
    voteCount: number;
  }[];
}

export function useOverview(){
    return useQuery({
        queryKey: ["overview"],
        queryFn: () => api<AdminOverview>("/admin/overview"),
        refetchInterval: 60000,
    })
}