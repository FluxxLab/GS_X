"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room } from "livekit-client";
import { api } from "./api";
import { getSocket, joinRoomWithAck, leaveRoom } from "./socket";

export type CaptureState = "idle" | "starting" | "capturing" | "error";

/** Milliseconds of continuous quiet before the UI calls the mic dead. */
const SILENCE_HOLD_MS = 4000;
/** Normalised level (0..1 over a -60 dBFS floor) that counts as speech. */
const SIGNAL_FLOOR = 0.2;

interface CaptureResources {
  stream: MediaStream;
  recorder: MediaRecorder;
  audioCtx: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  raf: number;
  livekit: Room | null;
}

export function useCapture(roomName: string | null, diarise = true) {
  const [state, setState] = useState<CaptureState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [signal, setSignal] = useState(true);
  const [livekitOk, setLivekitOk] = useState<boolean | null>(null);
  const [livekitError, setLivekitError] = useState<string | null>(null);
  /** False while the socket is down mid-capture, so the desk can see why. */
  const [connected, setConnected] = useState(true);
  const res = useRef<CaptureResources | null>(null);
  const lastSoundRef = useRef(0);
  const cleanupSocketRef = useRef<(() => void) | null>(null);

  const stop = useCallback(async () => {
    const r = res.current;
    res.current = null;
    if (r) {
      cancelAnimationFrame(r.raf);
      if (r.recorder.state !== "inactive") r.recorder.stop();
      r.stream.getTracks().forEach((t) => t.stop());
      r.source.disconnect();
      r.analyser.disconnect();
      await r.audioCtx.close().catch(() => {});
      await r.livekit?.disconnect().catch(() => {});
    }
    cleanupSocketRef.current?.();
    cleanupSocketRef.current = null;
    if (roomName) leaveRoom("capture:start", "caption:stop", { room: roomName, diarise });
    setState("idle");
    setLevel(0);
    setSignal(true);
    setLivekitOk(null);
    setLivekitError(null);
    setConnected(true);
  }, [roomName, diarise]);

  const start = useCallback(async () => {
    if (!roomName || res.current) return;
    setState("starting");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });

      const socket = await getSocket();

      // capture:start goes through the room registry so it is REPLAYED after
      // socket reconnects. The backend keeps captureRoom in per-connection
      // state that a drop wipes.
      //
      // Waiting for the ack matters: the recorder's first chunk carries the
      // WebM header, and if it is emitted before the room's transcription
      // stream exists it is discarded, leaving Deepgram with undecodable
      // audio for the rest of the session.
      const ack = await joinRoomWithAck<{ capturing?: string; error?: string }>(
        "capture:start",
        { room: roomName, diarise },
      );
      if (ack?.error) {
        throw new Error(
          ack.error === "forbidden"
            ? "This account is not an admin, so it cannot capture."
            : ack.error,
        );
      }

      /**
       * Bitrate pinned rather than left to the browser. Chrome's default for
       * audio-only opus can sit well under 128kbps, and voice separation is
       * the first thing compression erodes: the streaming diariser tells
       * voices apart by spectral detail the encoder throws away first. This
       * is the cheapest lever on the "everyone reads as Speaker 1" problem.
       */
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128_000,
      });
      /**
       * `volatile`, so a chunk recorded while the link is down is thrown away
       * rather than queued. Socket.IO buffers ordinary emits and floods them
       * on reconnect, which on venue wifi means minutes-old audio arriving
       * ahead of the live room and eating the little bandwidth there is.
       * Live audio that missed its moment is worth nothing.
       */
      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) socket.volatile.emit("capture:audio", await e.data.arrayBuffer());
      };
      recorder.start(250);

      /**
       * A dropped socket costs more than the seconds it is down. The backend
       * keeps the capture room in per-connection state, and the transcriber
       * expects the WebM header that only arrives in a recorder's first
       * chunk - so after a reconnect the stream is rejoined and the recorder
       * restarted, which emits a fresh header. Without this the desk looks
       * fine and no caption has appeared since the blip.
       */
      const onDisconnect = () => setConnected(false);
      const onReconnect = () => {
        setConnected(true);
        void (async () => {
          try {
            await joinRoomWithAck("capture:start", { room: roomName, diarise });
          } catch {
            // the room registry replays it too; a failure here is not fatal
          }
          const r = res.current;
          if (!r) return;
          if (r.recorder.state !== "inactive") r.recorder.stop();
          r.recorder.start(250);
        })();
      };
      socket.on("disconnect", onDisconnect);
      socket.on("connect", onReconnect);
      cleanupSocketRef.current = () => {
        socket.off("disconnect", onDisconnect);
        socket.off("connect", onReconnect);
      };
      setConnected(socket.connected);

      // level meter
      const audioCtx = new AudioContext();
      // Constructed several awaits after the click, so it is outside the
      // activation window and can come up suspended.
      await audioCtx.resume();

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.6;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      // Anchor the graph. An analyser with no route to the destination has
      // nothing keeping it alive, and Chrome collects the source node with
      // it, which silently freezes the meter while capture keeps running.
      const silent = audioCtx.createGain();
      silent.gain.value = 0;
      analyser.connect(silent);
      silent.connect(audioCtx.destination);

      const data = new Float32Array(analyser.fftSize);
      lastSoundRef.current = performance.now();

      const tick = () => {
        analyser.getFloatTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += v * v;
        const rms = Math.sqrt(sum / data.length);
        // dBFS against a -60 floor, so a room mic still reads usefully
        const db = 20 * Math.log10(rms || 1e-8);
        const norm = Math.max(0, Math.min(1, (db + 60) / 60));
        setLevel(norm);
        const now = performance.now();
        if (norm > SIGNAL_FLOOR) lastSoundRef.current = now;
        setSignal(now - lastSoundRef.current < SILENCE_HOLD_MS);
        if (res.current) res.current.raf = requestAnimationFrame(tick);
      };

      // Phase A dual-publish to LiveKit, best-effort: captions keep working
      // even if remote listening fails.
      let livekit: Room | null = null;
      try {
        const { url, token } = await api<{ url: string; token: string }>(
          `/captions/rooms/${encodeURIComponent(roomName)}/publish-token`,
          { method: "POST" },
        );
        livekit = new Room();
        await livekit.connect(url, token);
        await livekit.localParticipant.publishTrack(stream.getAudioTracks()[0]);
        setLivekitOk(true);
        setLivekitError(null);
      } catch (e) {
        setLivekitError((e as Error).message);
        setLivekitOk(false);
      }

      res.current = { stream, recorder, audioCtx, source, analyser, raf: 0, livekit };
      res.current.raf = requestAnimationFrame(tick);
      setState("capturing");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
      await stop();
      setState("error");
    }
  }, [roomName, diarise, stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, error, level, signal, livekitOk, livekitError, connected, start, stop };
}
