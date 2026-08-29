import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export const TRIVIA_OPTIONS = ["A", "B", "C", "D"] as const;
export type TriviaOption = (typeof TRIVIA_OPTIONS)[number];
export type TriviaStatus = "draft" | "live" | "closed";

export interface TriviaQuestion {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: TriviaOption;
  explanation?: string | null;
  status: TriviaStatus;
  createdAt: string;
}

export interface TriviaInput {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: TriviaOption;
  explanation?: string;
}

export interface TriviaStats {
  questionId: string;
  playCount: number;
  distribution: Record<TriviaOption, number>;
}

export function useTriviaQuestions() {
  return useQuery({
    queryKey: ["trivia"],
    queryFn: () => api<TriviaQuestion[]>("/trivia"),
  });
}

export function useCreateTrivia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: TriviaInput) =>
      api<TriviaQuestion>("/trivia", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trivia"] }),
  });
}

/** Correct a question. A live one is re-sent to delegates immediately. */
export function useUpdateTrivia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<TriviaInput> }) =>
      api<TriviaQuestion>(`/trivia/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trivia"] }),
  });
}

/** Delete a question and every answer given to it. */
export function useDeleteTrivia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<void>(`/trivia/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trivia"] }),
  });
}

export function usePushTriviaLive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<TriviaQuestion>(`/trivia/${id}/live`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trivia"] }),
  });
}

export function useCloseTrivia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api<TriviaQuestion>(`/trivia/${id}/close`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trivia"] }),
  });
}

export function useTriviaStats(id: string | null) {
  return useQuery({
    queryKey: ["trivia-stats", id],
    queryFn: () => api<TriviaStats>(`/trivia/${id}/stats`),
    enabled: !!id,
    refetchInterval: 5_000,
  });
}
