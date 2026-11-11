import { useEffect, useRef, useState } from "react";

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

/** Connects to `WS /sessions/:id/live` and keeps the session state up to date. */
export function useLiveSession(sessionId: string) {
  const socket = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [live, setLive] = useState<LiveSession | null>(null);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);

  const connect = (delayMs = 0) => {
    socket.current?.close();
    const ws = new WebSocket(websocketUrl(`/sessions/${sessionId}/live?delay=${delayMs}`));
    socket.current = ws;
    setStatus("connecting");
    setLive(null);
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
  };

  const disconnect = () => {
    socket.current?.close();
    socket.current = null;
    setStatus("closed");
  };

  const send = (message: ClientMessage) => socket.current?.send(JSON.stringify(message));

  useEffect(() => () => socket.current?.close(), []);

  return { status, live, lastMessage, connect, disconnect, send };
}
