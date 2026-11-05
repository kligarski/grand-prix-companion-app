import type { DriverTableEntry, StandingsTableEntry } from "@/components/ui";
import { teamColors } from "@/theme";

export const FAVOURITE_CODE = "KOV";

export const qualifyingResults: DriverTableEntry[] = [
  { position: 1, code: "VRN", name: "Varen", teamColor: teamColors.aster, value: "1:29.884" },
  { position: 2, code: "OKO", name: "Okoro", teamColor: teamColors.borealis, value: "+0.118" },
  { position: 3, code: "LIN", name: "Lindqvist", teamColor: teamColors.cobalt, value: "+0.240" },
  { position: 4, code: "SAT", name: "Sato", teamColor: teamColors.borealis, value: "+0.355" },
  { position: 5, code: "MRE", name: "Moreau", teamColor: teamColors.dune, value: "+0.402" },
  { position: 6, code: "HAL", name: "Hale", teamColor: teamColors.cobalt, value: "+0.511" },
  { position: 7, code: "RUI", name: "Ruiz", teamColor: teamColors.ember, value: "+0.638" },
  { position: 8, code: "BEK", name: "Becker", teamColor: teamColors.dune, value: "+0.702" },
  { position: 9, code: "NAS", name: "Nasser", teamColor: teamColors.ember, value: "+0.877" },
  { position: 12, code: "KOV", name: "Kovač", teamColor: teamColors.fjord, value: "+1.032" },
];

export const raceTiming: DriverTableEntry[] = [
  { position: 1, code: "VRN", teamColor: teamColors.aster, value: "LEADER", tyre: "MEDIUM" },
  { position: 2, code: "OKO", teamColor: teamColors.borealis, value: "+0.412", tyre: "HARD" },
  { position: 3, code: "LIN", teamColor: teamColors.cobalt, value: "+0.655", tyre: "HARD" },
  { position: 4, code: "SAT", teamColor: teamColors.borealis, value: "+0.508", tyre: "MEDIUM" },
  { position: 5, code: "MRE", teamColor: teamColors.dune, value: "+0.731", tyre: "MEDIUM" },
  { position: 6, code: "HAL", teamColor: teamColors.cobalt, value: "+1.204", tyre: "SOFT" },
  { position: 7, code: "RUI", teamColor: teamColors.ember, value: "+0.932", tyre: "HARD" },
  { position: 8, code: "BEK", teamColor: teamColors.dune, value: "+2.118", tyre: "HARD" },
  { position: 12, code: "KOV", teamColor: teamColors.fjord, value: "+0.844", tyre: "MEDIUM" },
];

export const driverStandings: StandingsTableEntry[] = [
  { id: "VRN", position: 1, title: "A. Varen", subtitle: "Team Aster", teamColor: teamColors.aster, points: 264 },
  { id: "OKO", position: 2, title: "M. Okoro", subtitle: "Team Borealis", teamColor: teamColors.borealis, points: 241 },
  { id: "LIN", position: 3, title: "J. Lindqvist", subtitle: "Team Cobalt", teamColor: teamColors.cobalt, points: 198 },
  { id: "SAT", position: 4, title: "K. Sato", subtitle: "Team Borealis", teamColor: teamColors.borealis, points: 176 },
  { id: "MRE", position: 5, title: "D. Moreau", subtitle: "Team Dune", teamColor: teamColors.dune, points: 131 },
  { id: "KOV", position: 9, title: "E. Kovač", subtitle: "Team Fjord", teamColor: teamColors.fjord, points: 64 },
];

export const constructorStandings: StandingsTableEntry[] = [
  { id: "aster", position: 1, title: "Team Aster", teamColor: teamColors.aster, points: 402 },
  { id: "borealis", position: 2, title: "Team Borealis", teamColor: teamColors.borealis, points: 389 },
  { id: "cobalt", position: 3, title: "Team Cobalt", teamColor: teamColors.cobalt, points: 344 },
  { id: "dune", position: 4, title: "Team Dune", teamColor: teamColors.dune, points: 201 },
];
