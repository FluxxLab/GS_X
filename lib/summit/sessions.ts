import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const TRACKS = [
  "plenary",
  "gbv",
  "health",
  "economic",
  "innovation",
  "digital",
  "youth",
] as const;
export type Track = (typeof TRACKS)[number];

export const SESSION_STATUSES = ["scheduled", "live", "completed"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export interface Session {
  id: string;
  title: string;
  description?: string;
  day: number;
  startsAt: string;
  endsAt: string;
  room: string;
  track: Track;
  type: string;
  audience?: string;
  status: SessionStatus;
   speakers?: { id: string; name: string; role: string | null; organisation: string | null }[];
}



export type SessionInput = Omit<Session, "id" | "status" | "speakers"> & {
  speakerIds?: string[];
};

 async function fetchSession(): Promise<Session[]>{
    const res = await api<Session[]>("/sessions");
    return Array.isArray(res) ? res : [];
}

export function useSessions(){
    return useQuery({queryKey: ["sessions"], queryFn: fetchSession});
}

export function useCreateSession(){
    const qc = useQueryClient();
    return useMutation<Session, Error, SessionInput>({
        mutationFn: (input: SessionInput) => api<Session>("/sessions", {method: "POST", body: JSON.stringify(input)}),
        onSuccess: (data) => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}

export function useBulkCreateSessions(){
    const qc = useQueryClient();
    return useMutation<Session[], Error, SessionInput[]>({
        mutationFn: (inputs: SessionInput[]) => api<Session[]>("/sessions/bulk", {method: "POST", body: JSON.stringify(inputs)}),
        onSuccess: () => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}

export function useUpdateSession(){
    const qc  = useQueryClient();
    return useMutation({
        mutationFn: ({id, ...input}: Partial<SessionInput> & {id: string}) =>
            api<Session>(`/sessions/${id}`, {method: "PATCH", body: JSON.stringify(input)}),
        onSuccess: () => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}

export function useUpdateSessionStatus() {
  const qc = useQueryClient();
  return useMutation<Session, Error, { id: string; status: SessionStatus }>({
    mutationFn: ({ id, status }) =>
      api<Session>(`/sessions/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}



    
