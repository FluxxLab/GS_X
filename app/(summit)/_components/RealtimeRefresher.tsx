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
    // Ballot movement, and the two state changes that decide when a tally is
    // a result. All three land on the same query key.
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
        s.on("voting:opened", onTally);
        s.on("voting:closed", onTally);
        s.on("voting:topic-updated", onTally);
        s.on("voting:topic-deleted", onTally);
        s.on("voting:entry-updated", onTally);
        s.on("voting:entry-deleted", onTally);
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
      s?.off("voting:opened", onTally);
      s?.off("voting:closed", onTally);
      s?.off("voting:topic-updated", onTally);
      s?.off("voting:topic-deleted", onTally);
      s?.off("voting:entry-updated", onTally);
      s?.off("voting:entry-deleted", onTally);
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
