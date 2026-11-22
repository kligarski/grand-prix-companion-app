import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AppState, type AppStateStatus } from "react-native";

import type { ClientMessage, Season, SessionDetails } from "./protocol";
import { getJson, SESSION_ID } from "./server";
import { useLiveSession, type LiveSession, type LiveStatus } from "./useLiveSession";

export type SessionData = {
  session: SessionDetails | null;
  season: Season | null;
  /** Why the last fetch of the session failed, cleared when one succeeds. */
  sessionError: string | null;
  /** Why the last fetch of the season failed, cleared when one succeeds. */
  seasonError: string | null;
  /** Whether a fetch is in flight. */
  loading: boolean;
  /** Fetches the session and the season again. */
  reload: () => void;
};

export type Live = {
  status: LiveStatus;
  live: LiveSession | null;
  /** Sends a message if the socket is open. Returns whether it was sent. */
  send: (message: ClientMessage) => boolean;
  /** Opens a new socket in place of the current one, at the last delay. */
  reconnect: () => void;
};

const SessionDataContext = createContext<SessionData | null>(null);
const LiveContext = createContext<Live | null>(null);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

type Setter<T> = Dispatch<SetStateAction<T>>;

/** Fetches `path` into `setData`, or its error into `setError`. Ignores the result once `signal` aborts. */
function load<T>(path: string, signal: AbortSignal, setData: Setter<T | null>, setError: Setter<string | null>) {
  return getJson<T>(path, signal).then(
    (result) => {
      if (signal.aborted) return;
      setData(result);
      setError(null);
    },
    (reason: unknown) => {
      if (!signal.aborted) setError(errorMessage(reason));
    },
  );
}

function SessionDataProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [season, setSeason] = useState<Season | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [seasonError, setSeasonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      load(`/sessions/${SESSION_ID}`, controller.signal, setSession, setSessionError),
      load("/season", controller.signal, setSeason, setSeasonError),
    ]).then(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [attempt]);

  // Errors stay until a fetch succeeds, so the error card doesn't disappear while retrying.
  const reload = () => {
    setLoading(true);
    setAttempt((current) => current + 1);
  };

  return (
    <SessionDataContext value={{ session, season, sessionError, seasonError, loading, reload }}>
      {children}
    </SessionDataContext>
  );
}

function LiveProvider({ children }: { children: ReactNode }) {
  const { status, live, send: sendMessage, connect } = useLiveSession(SESSION_ID, { autoConnect: true });
  // The delay this viewer last chose, so a new socket picks up where the old one was.
  const delayMs = useRef(0);
  const liveDelayMs = live?.delayMs;

  useEffect(() => {
    if (liveDelayMs !== undefined) delayMs.current = liveDelayMs;
  }, [liveDelayMs]);

  const reconnect = () => connect(delayMs.current);

  const send = (message: ClientMessage) => {
    const sent = sendMessage(message);
    if (sent && message.type === "setDelay") delayMs.current = message.delayMs;
    return sent;
  };

  // A socket dropped while the app was in the background (or the server restarted) isn't retried on
  // its own; reconnect when the user comes back to the app.
  const onAppStateChange = useEffectEvent((state: AppStateStatus) => {
    if (state === "active" && (status === "closed" || status === "error")) reconnect();
  });

  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

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
