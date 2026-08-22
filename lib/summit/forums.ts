import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import type { SessionComment } from "./discussions";

/**
 * Forums: every discussion thread across every session, in one moderation
 * queue. The per-session view under /discussions is for working one room's
 * conversation; this is for sweeping the whole summit for anything reported
 * or already hidden.
 */
export interface ForumComment extends SessionComment {
  authorName: string;
  authorOrganisation: string | null;
  /** Resolved server-side: a cross-session list is meaningless without it. */
  sessionTitle: string;
}

/** Moderators default to seeing hidden comments; delegates never do. */
export type HiddenFilter = "include" | "exclude" | "only";

export interface ForumFilters {
  flagged?: boolean;
  hidden?: HiddenFilter;
  sessionId?: string;
}

function toQuery(filters: ForumFilters): string {
  const params = new URLSearchParams();
  if (filters.flagged) params.set("flagged", "true");
  if (filters.hidden && filters.hidden !== "include") params.set("hidden", filters.hidden);
  if (filters.sessionId) params.set("sessionId", filters.sessionId);
  const q = params.toString();
  return q ? `?${q}` : "";
}

export function useForumComments(filters: ForumFilters) {
  return useQuery({
    queryKey: ["forums", filters],
    queryFn: async () => {
      const res = await api<ForumComment[]>(`/discussions/comments${toQuery(filters)}`);
      return Array.isArray(res) ? res : [];
    },
    // Moderation is a live job during sessions, but not a firehose.
    refetchInterval: 15_000,
  });
}

export function useHideForumComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api(`/discussions/comments/${id}/hide`, { method: "PATCH" }),
    // Invalidate both surfaces: the same comment may be open in the
    // per-session thread as well.
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["forums"] });
      void qc.invalidateQueries({ queryKey: ["discussion"] });
    },
  });
}
