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
}
export type SessionInput = Omit<Session, "id">;

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
        mutationFn: (input: SessionInput) => api<Session>("/Sessions", {method: "POST", body: JSON.stringify(input)}),
        onSuccess: (data) => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}

export function useUpdateSession(){
    const qc  = useQueryClient();
    return useMutation({
        mutationFn: ({id, ...input}: Partial<SessionInput> & {id: string}) =>
            api<Session>(`Sessions/${id}`, {method: "PATCH", body: JSON.stringify(input)}),
        onSuccess: () => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}

export function useUpdateSessionStatus(){
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({id, status}: {id: string; status: SessionStatus}) => 
            api<Session>(`/Sessions/${id}`,{
                method: "PATCH",
                body: JSON.stringify({status}),
            }),
            onSuccess: (data) => qc.invalidateQueries({queryKey: ["sessions"]}),
    });
}


    
