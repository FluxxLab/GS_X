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
