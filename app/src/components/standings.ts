import type { Season } from "@/api/protocol";
import type { StandingsTableEntry } from "@/components/ui";

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
