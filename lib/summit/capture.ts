"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Room } from "livekit-client";
import { api } from "./api";
import { getSocket, joinRoom, leaveRoom } from "./socket";

export type CaptureState = "idle" | "starting" | "capturing" | "error";

interface CaptureResources {
  stream: MediaStream;
  recorder: MediaRecorder;
  audioCtx: AudioContext;
  raf: number;
  livekit: Room | null;
}

export function useCapture(roomName: string | null) {
  const [state, setState] = useState<CaptureState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [livekitOk, setLivekitOk] = useState<boolean | null>(null);
  const res = useRef<CaptureResources | null>(null);

  const stop = useCallback(async () => {
    const r = res.current;
    res.current = null;
    if (r) {
      cancelAnimationFrame(r.raf);
      if (r.recorder.state !== "inactive") r.recorder.stop();
      r.stream.getTracks().forEach((t) => t.stop());
      await r.audioCtx.close().catch(() => {});
      await r.livekit?.disconnect().catch(() => {});
    }
    if (roomName) leaveRoom("capture:start", "caption:stop", roomName);
    setState("idle");
    setLevel(0);
    setLivekitOk(null);
  }, [roomName]);

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
      // socket reconnects — the backend keeps captureRoom in per-connection
      // state that a drop wipes.
      await joinRoom("capture:start", roomName);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      recorder.ondataavailable = async (e) => {
        if (e.data.size > 0) socket.emit("capture:audio", await e.data.arrayBuffer());
      };
      recorder.start(250);

      // level meter
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      audioCtx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let peak = 0;
        for (const v of data) peak = Math.max(peak, Math.abs(v - 128) / 128);
        setLevel(peak);
        if (res.current) res.current.raf = requestAnimationFrame(tick);
      };

      // Phase A dual-publish to LiveKit — best-effort: captions keep working
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
      } catch {
        setLivekitOk(false);
      }

      res.current = { stream, recorder, audioCtx, raf: 0, livekit };
      res.current.raf = requestAnimationFrame(tick);
      setState("capturing");
    } catch (e) {
      setError((e as Error).message);
      setState("error");
      await stop();
      setState("error");
    }
  }, [roomName, stop]);

  useEffect(() => {
    return () => {
      void stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { state, error, level, livekitOk, start, stop };
}
