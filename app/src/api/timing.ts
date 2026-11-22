import type { DriverTableEntry, TyreCompound } from "@/components/ui";

import type { Gap, SessionDetails, SessionState } from "./protocol";

/** The interval to the car ahead: "LEADER", "+1.234", "+1L", or a dash when there's none. */
export function formatInterval(gap: Gap, position: number): string {
  if (position === 1) return "LEADER";
  if (!gap) return "–";
  if (gap.laps > 0) return `+${gap.laps}L`;
  return gap.ms === null ? "–" : `+${(gap.ms / 1000).toFixed(3)}`;
}

/** The timing list: drivers with a position, in running order, with their interval and tyre. */
export function toTimingEntries(session: SessionDetails | null, state: SessionState | undefined): DriverTableEntry[] {
  return (session?.drivers ?? [])
    .flatMap((driver) => {
      const driverState = state?.drivers[driver.number];
      if (!driverState?.position) return [];
      const compound = driverState.tyre?.compound;
      return {
        position: driverState.position,
        code: driver.code,
        teamColor: `#${driver.teamColour}`,
        value: formatInterval(driverState.interval, driverState.position),
        tyre: compound && compound !== "UNKNOWN" ? (compound as TyreCompound) : undefined,
      };
    })
    .sort((a, b) => a.position - b.position);
}
