import type { ResultEntry, Round, RoundResults, Season, SeasonSession } from "./protocol";

/** The round after the last one the standings cover, i.e. this weekend's. */
export function nextRound(season: Season): Round | null {
  return season.schedule.find((round) => round.round === season.asOfRound + 1) ?? null;
}

export const SESSION_LABELS: Record<SeasonSession["type"], string> = {
  FP1: "Practice 1",
  FP2: "Practice 2",
  FP3: "Practice 3",
  SprintQualifying: "Sprint Qualifying",
  Sprint: "Sprint",
  Qualifying: "Qualifying",
  Race: "Race",
};

// The device's locale and time zone, so a 24-hour locale reads "Fri 13:30" and en-US "Fri 1:30 PM".
const sessionTimeFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });

/** A session's start in the device's time zone, e.g. "Fri 13:30". */
export function formatSessionTime(utc: string): string {
  return sessionTimeFormat.format(new Date(utc));
}

/** Where each session's results live in `RoundResults`. */
export const RESULT_KEYS: Record<SeasonSession["type"], keyof RoundResults> = {
  FP1: "fp1",
  FP2: "fp2",
  FP3: "fp3",
  SprintQualifying: "sprintQualifying",
  Sprint: "sprint",
  Qualifying: "qualifying",
  Race: "race",
};

/** Labels short enough for up to five segments in a row. */
export const SHORT_SESSION_LABELS: Record<SeasonSession["type"], string> = {
  FP1: "FP1",
  FP2: "FP2",
  FP3: "FP3",
  SprintQualifying: "SQ",
  Sprint: "Sprint",
  Qualifying: "Quali",
  Race: "Race",
};

/** A session of a round, e.g. round 10 Qualifying. */
export type SessionSelection = { round: number; session: SeasonSession["type"] };

/** A session's results, or null when the server has none (or an older server doesn't send the key). */
export function sessionResults(season: Season, { round, session }: SessionSelection): ResultEntry[] | null {
  const results = season.results[String(round)]?.[RESULT_KEYS[session]];
  return results && results.length > 0 ? results : null;
}

/** A round's sessions that have results, in time order. */
export function sessionsWithResults(season: Season, round: number): SeasonSession["type"][] {
  const sessions = season.schedule.find((entry) => entry.round === round)?.sessions ?? [];
  return [...sessions]
    .sort((a, b) => Date.parse(a.startUtc) - Date.parse(b.startUtc))
    .map((session) => session.type)
    .filter((session) => sessionResults(season, { round, session }) !== null);
}

/** Rounds with results for at least one session, in calendar order. */
export function roundsWithResults(season: Season): Round[] {
  return season.schedule.filter((round) => sessionsWithResults(season, round.round).length > 0);
}

/**
 * The session to show after picking `round`: the same kind of session as before if the round has it,
 * otherwise its latest one.
 */
export function selectRound(
  season: Season,
  round: number,
  previous?: SeasonSession["type"],
): SessionSelection | null {
  const sessions = sessionsWithResults(season, round);
  if (sessions.length === 0) return null;
  const session = previous && sessions.includes(previous) ? previous : sessions[sessions.length - 1];
  return { round, session };
}

/**
 * `selection` if it still has results, otherwise the latest session with results: this weekend's
 * qualifying while the race runs, or the last race before it.
 */
export function resolveSelection(season: Season, selection: SessionSelection | null): SessionSelection | null {
  if (selection && sessionResults(season, selection)) return selection;
  const latest = roundsWithResults(season).at(-1);
  return latest ? selectRound(season, latest.round) : null;
}
