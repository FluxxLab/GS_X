import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./api";

/**
 * Caption languages, mirroring the backend CaptionLanguage enum.
 *
 * English is the transcription language and arrives first; the rest are
 * machine translations of an English final, so they land a beat later and only
 * ever as finals.
 */
export const CAPTION_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "yo", label: "Yoruba" },
  { code: "pcm", label: "Nigerian Pidgin" },
  {code: "fr", label: "French"}
] as const;

export type CaptionLanguageCode = (typeof CAPTION_LANGUAGES)[number]["code"];

/**
 * What was already said in this session, in one language.
 *
 * The monitor otherwise starts empty every time the page is opened or the
 * language is switched, which makes a running session look like a dead one.
 * Kept separate from the live lines rather than merged into them: this is
 * refetched on a language switch, and merging would duplicate every line
 * already on screen.
 *
 * Requesting a language the API has not translated yet queues that work in the
 * background and returns what exists, so this is cheap to call on every switch.
 */
export interface RecentCaption {
  text: string;
  speaker: number | null;
  at: string;
}

export function useCaptionHistory(
  sessionId: string | null,
  language: CaptionLanguageCode,
) {
  return useQuery({
    queryKey: ["captions", "history", sessionId, language],
    enabled: Boolean(sessionId),
    queryFn: () =>
      api<RecentCaption[]>(
        `/captions/${sessionId}/captions?language=${language}`,
      ),
    // A live session gains lines constantly; a cached history would show the
    // room as it was when the tab was last opened.
    staleTime: 0,
  });
}

/**
 * Wipe a session's captions. Live-ops escape hatch: a capture feed pointed at
 * the wrong room, or a stretch of transcript that should not stand.
 *
 * Destructive and total - captions and the stored transcript are the same rows
 * on the API side, so this clears the archive and the CSV/TXT export for that
 * session as well. There is no undo, which is why the caller confirms first.
 *
 * The API also tells every language room, so delegates watching in Hausa or
 * Pidgin clear too, not just whichever language this page happens to show.
 */
export function useClearCaptions(sessionId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api<{ deleted: number }>(`/captions/${sessionId}/captions`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["captions", "history", sessionId] });
      qc.invalidateQueries({ queryKey: ["transcript", sessionId] });
    },
  });
}
