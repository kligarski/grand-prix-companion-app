import type { Round, Season, SeasonSession } from "./protocol";

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
