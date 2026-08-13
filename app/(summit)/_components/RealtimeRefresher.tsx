"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, joinRoom, leaveRoom } from "@/lib/summit/socket";
import type { Socket } from "socket.io-client";

export default function RealtimeRefresher() {
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let s: Socket | null = null;

    const onSession = () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["overview"] });
      qc.invalidateQueries({ queryKey: ["live-ops"] });
    };
    const onNotification = () => qc.invalidateQueries({ queryKey: ["notifications"] });
    const onTally = () => qc.invalidateQueries({ queryKey: ["voting"] });
    const onTrivia = () => qc.invalidateQueries({ queryKey: ["trivia"] });
    const onFlags = () => qc.invalidateQueries({ queryKey: ["live-ops"] });

    getSocket()
      .then((sock) => {
        if (cancelled) return;
        s = sock;
        s.on("session:status", onSession);
        s.on("notification", onNotification);
        s.on("voting:tally", onTally);
        s.on("trivia:distribution", onTrivia);
        s.on("trivia:question", onTrivia);
        s.on("trivia:closed", onTrivia);
        s.on("broadcast:flags", onFlags);

        void joinRoom("notifications:join");
        void joinRoom("voting:join");
        void joinRoom("trivia:join");
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      s?.off("session:status", onSession);
      s?.off("notification", onNotification);
      s?.off("voting:tally", onTally);
      s?.off("trivia:distribution", onTrivia);
      s?.off("trivia:question", onTrivia);
      s?.off("trivia:closed", onTrivia);
      s?.off("broadcast:flags", onFlags);
      leaveRoom("notifications:join", "notifications:leave");
      leaveRoom("voting:join", "voting:leave");
      leaveRoom("trivia:join", "trivia:leave");
    };
  }, [qc]);

  return null;
}
