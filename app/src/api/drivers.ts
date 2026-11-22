import type { DriverPickerItem } from "@/components/ui";

import type { Driver, Season, SessionDetails } from "./protocol";

/**
 * The session's drivers in championship order. Drivers missing from the standings go last, in feed
 * order. Without the season, the feed order.
 */
export function driversInChampionshipOrder(session: SessionDetails, season: Season | null): Driver[] {
  if (!season) return session.drivers;
  const rank = new Map(season.driverStandings.map((standing, index) => [standing.driver.code, index]));
  const rankOf = (driver: Driver) => rank.get(driver.code) ?? Infinity;
  // Array.prototype.sort is stable, so unranked drivers keep their feed order.
  return [...session.drivers].sort((a, b) => (rankOf(a) === rankOf(b) ? 0 : rankOf(a) - rankOf(b)));
}

/** Tiles for `DriverPickerGrid`, in championship order. */
export function driverPickerItems(session: SessionDetails, season: Season | null): DriverPickerItem[] {
  return driversInChampionshipOrder(session, season).map((driver) => ({
    code: driver.code,
    name: `${driver.firstName.charAt(0)}. ${driver.lastName}`,
    team: driver.team,
    teamColor: `#${driver.teamColour}`,
  }));
}
