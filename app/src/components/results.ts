import type { ResultEntry } from "@/api/protocol";
import type { DriverTableEntry } from "@/components/ui";

import { teamColor } from "./standings";

/**
 * What a result row shows on the right. The leader's time, then gaps: timed sessions have a `gap` for
 * drivers who set a time in the final segment, and everyone else (and every race row, where `time` is
 * already a gap or "+1 Lap") shows `time`. Then the status ("Retired", "Did not start"), else a dash.
 * `||` rather than `??`, so an empty string (an older server's "no time") falls through as well, and a
 * missing `gap` covers a server that doesn't send it.
 */
function resultValue({ position, time, gap, status }: ResultEntry): string {
  return (position === 1 ? time : gap || time) || status || "–";
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
