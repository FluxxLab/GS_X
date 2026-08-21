"use client";
import { io, type Socket } from "socket.io-client";

import { SOCKET_URL } from "./config";

let socket: Socket | null = null;
let connecting: Promise<Socket> | null = null;

const joinedRooms = new Map<string, { joinEvent: string; payload?: unknown }>();
const roomKey = (joinEvent: string, payload?: unknown) => {
  if (payload === undefined) return `${joinEvent}|`;
  // Object payloads (a caption room now carries a language) all stringify to
  // "[object Object]", which would collide in the registry and make leaving
  // one subscription drop an unrelated one.
  const key = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
  return `${joinEvent}|${key}`;
};

async function fetchToken(): Promise<string> {
  const res = await fetch("/api/gs26/auth/socket-token");
  if (!res.ok) throw new Error("Not authenticated");
  const { token } = (await res.json()) as { token: string };
  return token;
}

export async function getSocket(): Promise<Socket> {
  if (socket) return socket;
  if (connecting) return connecting;

  connecting = (async () => {
    const token = await fetchToken();
    const s = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });

    s.on("connect", () => {
      for (const { joinEvent, payload } of joinedRooms.values()) s.emit(joinEvent, payload);
    });

    s.on("connect_error", async (error) => {
      if (error.message !== "unauthorized") return;
      try {
        s.auth = { token: await fetchToken() };
        s.connect();
      } catch {
        s.disconnect();
      }
    });

    socket = s;
    return s;
  })().finally(() => {
    connecting = null;
  });

  return connecting;
}

export async function joinRoom(joinEvent: string, payload?: unknown): Promise<void> {
  const s = await getSocket();
  joinedRooms.set(roomKey(joinEvent, payload), { joinEvent, payload });
  s.emit(joinEvent, payload);
}

/**
 * joinRoom, but waits for the gateway's ack. Use it when the caller must not
 * send data until the server side is ready: audio emitted before the room's
 * transcription stream exists is dropped on the floor.
 */
export async function joinRoomWithAck<T>(
  joinEvent: string,
  payload?: unknown,
  timeoutMs = 15_000,
): Promise<T> {
  const s = await getSocket();
  joinedRooms.set(roomKey(joinEvent, payload), { joinEvent, payload });
  return (await s.timeout(timeoutMs).emitWithAck(joinEvent, payload)) as T;
}

export function leaveRoom(joinEvent: string, leaveEvent: string, payload?: unknown): void {
  joinedRooms.delete(roomKey(joinEvent, payload));
  socket?.emit(leaveEvent, payload);
}

export function disconnectSocket(): void {
  joinedRooms.clear();
  socket?.disconnect();
  socket = null;
}
