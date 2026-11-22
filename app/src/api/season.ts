import type { StandingsTableEntry } from "@/components/ui";

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

/** `teamColour` as a colour value, or `fallback` (a theme token) when the source has none. */
function teamColor(teamColour: string | null, fallback: string): string {
  return teamColour ? `#${teamColour}` : fallback;
}

/** Driver standings rows keyed by driver code, e.g. "A. Antonelli" from "Mercedes". */
export function toDriverStandingEntries(season: Season, fallbackColor: string): StandingsTableEntry[] {
  return season.driverStandings.map((standing) => ({
    id: standing.driver.code,
    position: standing.position,
    title: `${standing.driver.firstName.charAt(0)}. ${standing.driver.lastName}`,
    subtitle: standing.team,
    teamColor: teamColor(standing.teamColour, fallbackColor),
    points: standing.points,
  }));
}

/** Constructor standings rows keyed by team name. */
export function toConstructorStandingEntries(season: Season, fallbackColor: string): StandingsTableEntry[] {
  return season.constructorStandings.map((standing) => ({
    id: standing.team,
    position: standing.position,
    title: standing.team,
    teamColor: teamColor(standing.teamColour, fallbackColor),
    points: standing.points,
  }));
}
