import type { ResultEntry } from "@/api/protocol";
import type { DriverTableEntry } from "@/components/ui";

import { teamColor } from "./standings";

/**
 * What a result row shows on the right. The leader's time, then gaps: timed sessions have a `gap` for
 * drivers who set a time in the final segment, and everyone else (and every race row, where `time` is
 * already a gap) shows `time`. Then the status ("Retired", "Did not start"), else a dash. `gap ??`
 * also covers an older server that doesn't send it.
 */
function resultValue(entry: ResultEntry): string {
  const time = entry.position === 1 ? entry.time : (entry.gap ?? entry.time);
  return time ?? entry.status ?? "–";
}

/** A session's results as driver rows. Drivers without a classified position show "NC". */
export function toResultTableEntries(entries: readonly ResultEntry[], fallbackColor: string): DriverTableEntry[] {
  return entries.map((entry) => ({
    position: entry.position ?? "NC",
    code: entry.driver.code,
    name: entry.driver.lastName,
    teamColor: teamColor(entry.teamColour, fallbackColor),
    value: resultValue(entry),
  }));
}
