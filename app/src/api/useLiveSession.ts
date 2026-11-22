import { useEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from "react";

import type { ClientMessage, PositionFrame, ServerMessage, SessionState } from "./protocol";
import { applyPatch, websocketUrl } from "./server";

export type LiveStatus = "idle" | "connecting" | "open" | "closed" | "error";

export type LiveSession = {
  /** Where this viewer is in the timeline. */
  t: number;
  liveT: number;
  delayMs: number;
  state: SessionState;
  /** Latest car positions received. */
  positions: PositionFrame | null;
};

function reduce(live: LiveSession | null, message: ServerMessage): LiveSession | null {
  switch (message.type) {
    case "snapshot":
      return { t: message.t, liveT: message.liveT, delayMs: message.delayMs, state: message.state, positions: null };
    case "update":
      if (!live) return live;
      return {
        ...live,
        t: message.t,
        liveT: message.liveT,
        state: message.patch ? applyPatch(live.state, message.patch) : live.state,
        positions: message.positions?.at(-1) ?? live.positions,
      };
    case "error":
      return live;
  }
}

type Setter<T> = Dispatch<SetStateAction<T>>;

/** Opens a socket in place of the current one. State only changes in the socket's callbacks. */
function openSocket(
  socket: RefObject<WebSocket | null>,
  url: string,
  setStatus: Setter<LiveStatus>,
  setLive: Setter<LiveSession | null>,
  setLastMessage: Setter<ServerMessage | null>,
) {
  socket.current?.close();
  const ws = new WebSocket(url);
  socket.current = ws;
  // Ignore events from a socket that has since been replaced.
  ws.onopen = () => socket.current === ws && setStatus("open");
  ws.onerror = () => socket.current === ws && setStatus("error");
  ws.onclose = () => socket.current === ws && setStatus((current) => (current === "error" ? current : "closed"));
  ws.onmessage = (event) => {
    if (socket.current !== ws) return;
    const message = JSON.parse(String(event.data)) as ServerMessage;
    setLastMessage(message);
    setLive((current) => reduce(current, message));
  };
}

/** Connects to `WS /sessions/:id/live` and keeps the session state up to date. */
export function useLiveSession(sessionId: string, { autoConnect = false } = {}) {
  const socket = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<LiveStatus>(autoConnect ? "connecting" : "idle");
  const [live, setLive] = useState<LiveSession | null>(null);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

  const connect = (delayMs = 0) => {
    setStatus("connecting");
    setLive(null);
    openSocket(
      socket,
      websocketUrl(`/sessions/${sessionId}/live?delay=${delayMs}`),
      setStatus,
      setLive,
      setLastMessage,
    );
  };

  const disconnect = () => {
    socket.current?.close();
    socket.current = null;
    setStatus("closed");
  };

  /** Sends a message if the socket is open. Returns whether it was sent. */
  const send = (message: ClientMessage) => {
    const ws = socket.current;
    if (ws?.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(message));
    return true;
  };

  useEffect(() => {
    if (autoConnect) {
      openSocket(socket, websocketUrl(`/sessions/${sessionId}/live?delay=0`), setStatus, setLive, setLastMessage);
    }
    return () => socket.current?.close();
  }, [autoConnect, sessionId]);

  return { status, live, lastMessage, connect, disconnect, send };
}
