import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { Track } from "./sessions";

/**
 * Pitchathon is a ballot, not a like button: a topic holds several pitches and
 * each delegate casts one vote in it, changeable until the topic closes. So the
 * unit the dashboard works in is the topic, not the entry - a count only means
 * something next to the others on the same ballot.
 */
export type TopicVoting = "pending" | "open" | "closed";

export interface TopicTally {
  topicId: string;
  counts: Array<{ entryId: string; votes: number }>;
  /** Ballots cast. One per delegate, so this is also turnout. */
  voters: number;
}

export interface PitchEntry {
  id: string;
  innovatorName: string;
  country: string;
  track: Track;
  description: string;
  topicId: string;
  voteCount: number;
  createdAt: string;
}

export interface PitchTopic {
  id: string;
  name: string;
  position: number;
  voting: TopicVoting;
  /** The tally frozen at close - what was announced. Null until then. */
  result: TopicTally | null;
  closedAt: string | null;
  createdAt: string;
  entries: PitchEntry[];
  voters: number;
}

export interface PitchEntryInput {
  innovatorName: string;
  country: string;
  track: Track;
  description: string;
  topicId: string;
}

export interface PitchTopicInput {
  name: string;
  position?: number;
}

/**  Query key is ["voting"] on purpose: RealtimeRefresher already invalidates
/* that key on the voting socket events, so the standings are live without any
/* socket code in this feature.
*/
export function usePitchTopics() {
  return useQuery({
    queryKey: ["voting"],
    queryFn: () => api<PitchTopic[]>("/voting/topics"),
    refetchInterval: 20_000,
  });
}

export function useCreatePitchTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: PitchTopicInput) =>
      api<PitchTopic>("/voting/topics", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}

export function useUpdatePitchTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PitchTopicInput> }) =>
      api<PitchTopic>(`/voting/topics/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}

/** Withdraw a topic. This also deletes its pitches and every ballot cast in it. */
export function useDeletePitchTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/voting/topics/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}

/**
 * Open or close a topic's ballot.
 *
 * Closing is irreversible and is the moment the result is frozen server-side,
 * so the UI treats it as a destructive-grade action rather than a toggle.
 */
export function useSetTopicVoting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "open" | "close" }) =>
      api<PitchTopic>(`/voting/topics/${id}/${action}`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
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

/** Correct an entry's details. Ballots already cast are not affected. */
export function useUpdatePitchEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<PitchEntryInput> }) =>
      api<PitchEntry>(`/voting/entries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}

/** Withdraw an entry. This also deletes every ballot resting on it, which
 *  returns those delegates to "not yet voted" in the topic. */
export function useDeletePitchEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/voting/entries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["voting"] }),
  });
}

/** Share of the topic's ballots, which is the number worth reading out - a raw
 *  count means nothing without the size of the ballot it came from. */
export function share(votes: number, voters: number): number {
  return voters > 0 ? Math.round((votes / voters) * 100) : 0;
}

/**
 * The pitches that won, in order, with the margin over the runner-up.
 *
 * Reads the frozen `result` for a closed topic and the live entries otherwise,
 * so an announced winner never silently changes if a late ballot lands.
 */
export function standing(topic: PitchTopic): Array<PitchEntry & { votes: number }> {
  const frozen = new Map((topic.result?.counts ?? []).map((c) => [c.entryId, c.votes]));
  return [...topic.entries]
    .map((e) => ({
      ...e,
      votes: topic.voting === "closed" ? (frozen.get(e.id) ?? 0) : e.voteCount,
    }))
    .sort((a, b) => b.votes - a.votes);
}
