"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import { useSessions } from "@/lib/summit/sessions";
import { useCapture } from "@/lib/summit/capture";
import { getSocket, joinRoom, leaveRoom } from "@/lib/summit/socket";
import {
  CAPTION_LANGUAGES,
  useCaptionHistory,
  useClearCaptions,
  type CaptionLanguageCode,
} from "@/lib/summit/captions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CaptionEvent {
  sessionId: string;
  text: string;
  isFinal: boolean;
  language?: string;
  speaker?: number;
  at: string;
}

export default function CaptureClient() {
  const { data: sessions } = useSessions();
  const [room, setRoom] = useState("");
  /**
   * Streaming diarisation splits a single voice into several when the speaker
   * moves, laughs, or changes volume, so a keynote reads as a conversation
   * between two people. The operator knows how many microphones are in the
   * room; the diariser is guessing.
   */
  const [diarise, setDiarise] = useState(true);
  const { state, error, level, signal, livekitOk, livekitError, start, stop } =
    useCapture(room || null, diarise);

  const rooms = [...new Set((sessions ?? []).map((s) => s.room))].sort();
  const liveHere = (sessions ?? []).find((s) => s.room === room && s.status === "live") ?? null;

  const [lines, setLines] = useState<{ text: string; speaker: number | null }[]>(
    [],
  );
  const [interim, setInterim] = useState("");
  const [language, setLanguage] = useState<CaptionLanguageCode>("en");
  const [confirmClear, setConfirmClear] = useState(false);
  const clearCaptions = useClearCaptions(liveHere?.id ?? null);

  // What was said before this page was opened. Held apart from the live lines
  // because it is refetched whole on a language switch; merging the two would
  // duplicate everything already on screen.
  const { data: history, isPending: historyPending } = useCaptionHistory(
    liveHere?.id ?? null,
    language,
  );
  const transcript = useMemo(
    () => [
      ...(history ?? []).map((c) => ({ text: c.text, speaker: c.speaker })),
      ...lines,
    ],
    [history, lines],
  );

  // The panel scrolls, so new lines land out of view unless it follows them.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript.length, interim]);

  useEffect(() => {
    if (!liveHere) return;
    let cancelled = false;
    // One room per language, so switching means leaving the old one. Clearing
    // the buffer avoids two languages interleaving in the same panel.
    const subscription = { sessionId: liveHere.id, language };
    setLines([]);
    setInterim("");

    const onCaption = (c: CaptionEvent) => {
      if (c.sessionId !== liveHere.id) return;
      if (c.isFinal) {
        setInterim("");
        // No longer capped at the last four: the panel scrolls and carries the
        // session's history, so an operator can look back at what was said
        // rather than only at the sentence going past. Bounded well above a
        // day's captioning so a long plenary cannot grow it without limit.
        setLines((prev) => [
          ...prev.slice(-499),
          { text: c.text, speaker: c.speaker ?? null },
        ]);
      } else {
        const label = c.speaker === undefined ? "" : `Speaker ${c.speaker + 1}: `;
        setInterim(`${label}${c.text}`);
      }
    };
    getSocket()
      .then((s) => {
        if (cancelled) return;
        s.on("caption", onCaption);
        void joinRoom("captions:join", subscription);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      getSocket()
        .then((s) => s.off("caption", onCaption))
        .catch(() => {});
      leaveRoom("captions:join", "captions:leave", subscription);
    };
  }, [liveHere?.id, language]); // eslint-disable-line react-hooks/exhaustive-deps

  const capturing = state === "capturing";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-[family-name:var(--font-archivo)] text-3xl font-bold tracking-[-0.025em]">
          Capture
        </h1>
        <p className="mt-1 text-sm text-summit-smoke">
          Room audio to live captions and remote listening. Run this on the room laptop.
        </p>
      </header>

      <div className="glass-card flex flex-col gap-4 p-6">
        <Select
          value={room || "none"}
          disabled={capturing || state === "starting"}
          onValueChange={(val) => setRoom(val === "none" ? "" : val)}
        >
          <SelectTrigger className="w-72 rounded-xl border border-summit-lilac/15 bg-summit-lilac/5 px-3 py-2 text-sm text-summit-lilac focus:border-summit-cerise">
            <SelectValue placeholder="Pick this laptop&apos;s room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Pick this laptop&apos;s room</SelectItem>
            {rooms.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label
          className={cn(
            "flex w-fit cursor-pointer items-center gap-2 text-xs",
            capturing || state === "starting"
              ? "cursor-not-allowed text-summit-smoke/50"
              : "text-summit-smoke hover:text-summit-lilac",
          )}
        >
          <input
            type="checkbox"
            checked={!diarise}
            disabled={capturing || state === "starting"}
            onChange={(e) => setDiarise(!e.target.checked)}
            className="size-3.5 accent-summit-cerise"
          />
          One speaker in this room (no speaker labels)
        </label>

        {room && !liveHere && (
          <p className="text-sm text-summit-cream">
            Nothing is live in {room} right now. Audio is captured, but caption fragments are
            dropped until a session here goes live.
          </p>
        )}
        {liveHere && (
          <p className="text-sm text-summit-smoke">
            Live now: <span className="text-summit-lilac">{liveHere.title}</span>
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={capturing ? () => void stop() : () => void start()}
            disabled={!room || state === "starting"}
            className={cn(
              "flex items-center gap-2 rounded-[20px] px-6 py-3 text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50",
              capturing ? "bg-summit-cream text-summit-violet" : "bg-summit-cerise",
            )}
          >
            {capturing ? <Square className="size-4" /> : <Mic className="size-4" />}
            {state === "starting" ? "Starting" : capturing ? "Stop capture" : "Start capture"}
          </button>

          <div className="h-3 w-56 overflow-hidden rounded-full bg-white/10">
            <div
              style={{ width: `${Math.min(100, level * 100)}%` }}
              className={cn(
                "h-full rounded-full transition-[width] duration-75",
                signal ? "bg-summit-green" : "bg-summit-smoke/40",
              )}
            />
          </div>
          {capturing && !signal && (
            <span className="text-xs text-summit-cream">No signal for 4s. Check the mic.</span>
          )}
        </div>

        <div className="flex gap-4 text-xs text-summit-smoke">
          <span className={cn(capturing && "text-summit-green")}>
            ● captions {capturing ? "streaming" : "off"}
          </span>
          <span className={cn(livekitOk === true && "text-summit-green", livekitOk === false && "text-summit-cream")}>
            ● remote audio{" "}
            {livekitOk === null ? "idle" : livekitOk ? "publishing" : "failed, captions unaffected"}
          </span>
        </div>

        {livekitOk === false && livekitError && (
          <p className="text-xs text-summit-smoke">Remote audio: {livekitError}</p>
        )}
        {error && <p className="text-sm text-summit-cream">{error}</p>}
      </div>

      {liveHere && (
        <section className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
              Caption monitor
            </h2>
            <div className="flex flex-wrap items-center gap-1">
              {/* Live-ops escape hatch: a feed pointed at the wrong room leaves
                  the wrong words on 3,000 phones, and waiting on a database
                  console is not an option mid-session. */}
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={clearCaptions.isPending}
                className="mr-2 flex items-center gap-1.5 rounded-full border border-summit-cream/30 px-3 py-1 text-xs text-summit-cream transition-colors hover:bg-summit-cream/10 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                {clearCaptions.isPending ? "Clearing" : "Clear captions"}
              </button>
              {CAPTION_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs transition-colors",
                    language === l.code
                      ? "bg-summit-cerise text-white"
                      : "bg-summit-lilac/10 text-summit-smoke hover:text-summit-lilac",
                  )}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div
            ref={scrollRef}
            className="mt-3 flex max-h-96 min-h-24 flex-col gap-1 overflow-y-auto text-sm"
          >
            {transcript.map((l, i) => (
              <div key={i}>
                {/* Only where the speaker changes - repeating the label on
                    every line down a whole transcript buries the words. */}
                {l.speaker !== null &&
                  l.speaker !== transcript[i - 1]?.speaker && (
                    <p className="mt-2 text-xs text-summit-smoke">
                      Speaker {l.speaker + 1}
                    </p>
                  )}
                <p className="text-summit-lilac">{l.text}</p>
              </div>
            ))}
            {interim && <p className="text-summit-smoke italic">{interim}</p>}
            {transcript.length === 0 && !interim && (
              <p className="text-summit-smoke">
                {historyPending
                  ? "Loading what has been said…"
                  : language === "en"
                    ? "Captions appear here once speech is detected."
                    : "Translations arrive a moment after each English final, so this stays empty until a full phrase lands."}
              </p>
            )}
          </div>
        </section>
      )}
      <ConfirmDialog
        open={confirmClear}
        title="Clear captions?"
        message={`This permanently deletes every caption line for "${liveHere?.title ?? "this session"}", in all languages, and removes the stored transcript and its export. Delegates watching now will see their screens clear. This cannot be undone.`}
        confirmLabel="Clear captions"
        cancelLabel="Keep them"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          // clear what this page is showing too - the socket event tells the
          // delegates, but this admin is not in a captions room
          clearCaptions.mutate(undefined, { onSuccess: () => setLines([]) });
        }}
      />
    </div>
  );
}
