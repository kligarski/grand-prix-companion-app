import type { Round, Season } from "./protocol";

/** The round after the last one the standings cover, i.e. this weekend's. */
export function nextRound(season: Season): Round | null {
  return season.schedule.find((round) => round.round === season.asOfRound + 1) ?? null;
}
