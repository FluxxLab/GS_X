import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Tracks come from the API, never from a copy here.
 *
 * The database enum is what actually accepts or rejects a value, so a
 * hardcoded list in a client can only ever be right by luck - and this app,
 * the delegate app and the API had already drifted into three different
 * lists, two of which contained tracks the column would reject outright.
 */
export interface TrackOption {
  value: string;
  label: string;
}

/** Widened to string on purpose: the set is server-owned, so the compiler
 *  cannot know it, and pretending otherwise is what caused the drift. */
export type Track = string;

export function useTracks() {
  return useQuery({
    queryKey: ["tracks"],
    queryFn: async () => {
      const res = await api<TrackOption[]>("/sessions/tracks");
      return Array.isArray(res) ? res : [];
    },
    // The enum only changes with a migration, so this never needs refetching
    // within a session.
    staleTime: Infinity,
  });
}

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

/**
 * Delete a session with its bookmarks, attendance, comments and transcript.
 *
 * Without `force` the API refuses (409) when the session has attendance,
 * comments or captions, and the error message names what would be lost - the
 * caller shows that and retries with force once the organiser confirms.
 */
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string; force?: boolean }>({
    mutationFn: ({ id, force }) =>
      api<void>(`/sessions/${id}${force ? "?force=true" : ""}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
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



    
