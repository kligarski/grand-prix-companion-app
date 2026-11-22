import { createContext, use, useEffect, useState, type ReactNode } from "react";

import type { ClientMessage, Season, SessionDetails } from "./protocol";
import { getJson, SESSION_ID } from "./server";
import { useLiveSession, type LiveSession, type LiveStatus } from "./useLiveSession";

export type SessionData = {
  session: SessionDetails | null;
  season: Season | null;
  error: string | null;
  /** Fetches the session and the season again. */
  reload: () => void;
};

export type Live = {
  status: LiveStatus;
  live: LiveSession | null;
  send: (message: ClientMessage) => void;
  /** Opens a new socket in place of the current one. */
  reconnect: () => void;
};

const SessionDataContext = createContext<SessionData | null>(null);
const LiveContext = createContext<Live | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function SessionDataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const fail = (reason: unknown) => active && setError(errorMessage(reason));
    getJson<SessionDetails>(`/sessions/${SESSION_ID}`)
      .then((result) => active && setSession(result))
      .catch(fail);
    getJson<Season>("/season")
      .then((result) => active && setSeason(result))
      .catch(fail);
    return () => {
      active = false;
    };
  }, [attempt]);

  const reload = () => {
    setError(null);
    setAttempt((current) => current + 1);
  };

  return <SessionDataContext value={{ session, season, error, reload }}>{children}</SessionDataContext>;
}

function LiveProvider({ children }: { children: ReactNode }) {
  const { status, live, send, connect } = useLiveSession(SESSION_ID, { autoConnect: true });
  const reconnect = () => connect();

  return <LiveContext value={{ status, live, send, reconnect }}>{children}</LiveContext>;
}

/**
 * Owns the app's single connection to the server: one fetch each of the session and the season,
 * and one live socket. Static data and live updates are separate contexts, so screens that only
 * read `useSessionData()` don't re-render on every update.
 */
export function LiveSessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionDataProvider>
      <LiveProvider>{children}</LiveProvider>
    </SessionDataProvider>
  );
}

export function useSessionData(): SessionData {
  const data = use(SessionDataContext);
  if (!data) {
    throw new Error("useSessionData must be used inside <LiveSessionProvider>");
  }
  return data;
}

export function useLive(): Live {
  const live = use(LiveContext);
  if (!live) {
    throw new Error("useLive must be used inside <LiveSessionProvider>");
  }
  return live;
}
