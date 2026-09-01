import { useQuery } from "@tanstack/react-query";
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
