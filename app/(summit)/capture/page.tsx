"use client";

import { useEffect, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSessions } from "@/lib/summit/sessions";
import { useCapture } from "@/lib/summit/capture";
import { getSocket, joinRoom, leaveRoom } from "@/lib/summit/socket";
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
  at: string;
}

export default function CapturePage() {
  const { data: sessions } = useSessions();
  const [room, setRoom] = useState("");
  const { state, error, level, signal, livekitOk, livekitError, start, stop } =
    useCapture(room || null);

  const rooms = [...new Set((sessions ?? []).map((s) => s.room))].sort();
  const liveHere = (sessions ?? []).find((s) => s.room === room && s.status === "live") ?? null;

  const [lines, setLines] = useState<string[]>([]);
  const [interim, setInterim] = useState("");

  useEffect(() => {
    if (!liveHere) return;
    let cancelled = false;
    const onCaption = (c: CaptionEvent) => {
      if (c.sessionId !== liveHere.id) return;
      if (c.isFinal) {
        setInterim("");
        setLines((prev) => [...prev.slice(-3), c.text]);
      } else {
        setInterim(c.text);
      }
    };
    getSocket()
      .then((s) => {
        if (cancelled) return;
        s.on("caption", onCaption);
        void joinRoom("captions:join", liveHere.id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      getSocket()
        .then((s) => s.off("caption", onCaption))
        .catch(() => {});
      leaveRoom("captions:join", "captions:leave", liveHere.id);
    };
  }, [liveHere?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
          <h2 className="font-[family-name:var(--font-archivo)] text-lg font-bold tracking-[-0.02em]">
            Caption monitor
          </h2>
          <div className="mt-3 flex min-h-24 flex-col gap-1 text-sm">
            {lines.map((l, i) => (
              <p key={i} className="text-summit-lilac">{l}</p>
            ))}
            {interim && <p className="text-summit-smoke italic">{interim}</p>}
            {lines.length === 0 && !interim && (
              <p className="text-summit-smoke">Captions appear here once speech is detected.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
