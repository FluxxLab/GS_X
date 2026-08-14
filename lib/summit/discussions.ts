import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

export interface SessionComment {
  id: string;
  sessionId: string;
  authorId: string;
  body: string;
  flagged: boolean;
  hiddenAt: string | null;
  hiddenBy: string | null;
  createdAt: string;
}

export interface TranscriptSegment {
  id: string;
  sessionId: string;
  room: string;
  text: string;
  source: "ai" | "human";
  createdAt: string;
}

function normalize<T>(res: T[] | { data: T[] }): T[] {
  return Array.isArray(res) ? res : res.data;
}

export function useModerationThread(sessionId: string | null) {
  return useQuery({
    queryKey: ["discussion", sessionId],
    queryFn: async () =>
      normalize(
        await api<SessionComment[] | { data: SessionComment[] }>(
          `/discussions/sessions/${sessionId}/moderation`,
          { method: "PATCH" },
        ),
      ),
    enabled: !!sessionId,
    refetchInterval: 10_000,
  });
}

export function useHideComment(sessionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api(`/discussions/comments/${id}/hide`, { method: "PATCH" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["discussion", sessionId] }),
  });
}

export function useTranscript(sessionId: string | null) {
  return useQuery({
    queryKey: ["transcript", sessionId],
    queryFn: async () =>
      normalize(
        await api<TranscriptSegment[] | { data: TranscriptSegment[] }>(
          `/captions/${sessionId}/transcript`,
        ),
      ),
    enabled: !!sessionId,
  });
}
/* ── server-side audited exports ── */

async function downloadExport(path: string, filename: string) {
  const res = await fetch(`/api/gs26${path}`);
  if (!res.ok) throw new Error("Export failed — are you signed in as admin?");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const slug = (title: string) => title.toLowerCase().replace(/\W+/g, "-");

export function exportThread(sessionTitle: string, sessionId: string, format: "csv" | "json") {
  return downloadExport(
    `/discussions/sessions/${sessionId}/comments/export?format=${format}`,
    `gs26-thread-${slug(sessionTitle)}.${format}`,
  );
}

export function exportTranscript(sessionTitle: string, sessionId: string, format: "csv" | "txt") {
  return downloadExport(
    `/captions/${sessionId}/transcript/export?format=${format}`,
    `gs26-transcript-${slug(sessionTitle)}.${format}`,
  );
}

