// Keep in sync with the server.

// Wire format shared with the app. Keep this file self-contained (types only, no imports)
// so the app can copy it as is.
//
// Times called `t` are milliseconds since the start of the recording. Durations are milliseconds.
// Drivers are keyed by racing number as a string ("1", "44"), like the F1 feed.

export type DriverNumber = string;

// ---------- Static session data (REST) ----------

export type SessionInfo = {
  id: string;
  name: string;
  meeting: string;
  circuitId: string;
  /** UTC time of t = 0. */
  startUtc: string;
  /** t of the race start (session status "started"). */
  raceStartT: number;
  /** t of the last recorded event. */
  endT: number;
  totalLaps: number;
};

export type Driver = {
  number: DriverNumber;
  /** Three-letter code, e.g. "VER". */
  code: string;
  firstName: string;
  lastName: string;
  team: string;
  /** Hex colour without "#", e.g. "00D7B6". */
  teamColour: string;
  headshotUrl: string | null;
};

export type SessionDetails = SessionInfo & { drivers: Driver[] };

// ---------- Live session state ----------

/**
 * Gap to the leader or to the car ahead. The leader is { ms: 0, laps: 0 }. A lapped car has
 * `laps` > 0 and usually `ms` null. null means no gap yet.
 */
export type Gap = { ms: number | null; laps: number } | null;

export type TrackStatus = "green" | "yellow" | "sc" | "vsc" | "vscEnding" | "red";
export type SessionStatus = "inactive" | "started" | "finished" | "finalised";
export type SectorStatus = "personalBest" | "sessionBest" | "none";
/** "UNKNOWN" is sent by the feed when the compound isn't known yet. */
export type TyreCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | "UNKNOWN";

/** 0 not yet driven, 1 normal (yellow), 2 personal best (green), 3 session best (purple), 4 pit lane. */
export type MiniSector = 0 | 1 | 2 | 3 | 4;

export type Sector = { ms: number | null; status: SectorStatus };

export type Stint = {
  compound: TyreCompound;
  new: boolean;
  /** Tyre age when the stint started. */
  startLaps: number;
  /** Tyre age now (includes startLaps). */
  totalLaps: number;
};

export type PitStop = {
  lap: number | null;
  /** Stationary time. */
  stopMs: number | null;
  /** Time from pit entry to pit exit. */
  laneMs: number | null;
  utc: string;
};

export type LapRecord = { ms: number | null; position: number | null };

export type DriverState = {
  position: number | null;
  gapToLeader: Gap;
  interval: Gap;
  /** Completed laps. */
  laps: number;
  lastLapMs: number | null;
  bestLapMs: number | null;
  inPit: boolean;
  pitOut: boolean;
  retired: boolean;
  stopped: boolean;
  pitStopCount: number;
  /** Current lap's sectors (S1, S2, S3). */
  sectors: Sector[];
  /** Current lap's mini-sectors, all sectors flattened in order. */
  miniSectors: MiniSector[];
  bestSectorsMs: (number | null)[];
  /** Best speed at the speed trap, km/h. */
  speedTrapKph: number | null;
  tyre: { compound: TyreCompound; new: boolean; ageLaps: number } | null;
  /** Keyed by stint index ("0", "1", ...). */
  stints: Record<string, Stint>;
  /** Keyed by pit stop index ("0", "1", ...). */
  pitStops: Record<string, PitStop>;
  /** Keyed by lap number. */
  lapHistory: Record<string, LapRecord>;
};

export type Weather = {
  airTempC: number | null;
  trackTempC: number | null;
  humidity: number | null;
  pressureMbar: number | null;
  rainfall: boolean;
  windSpeedMs: number | null;
  windDirectionDeg: number | null;
};

/** Race control message in the feed's shape, plus `t`. */
export type RaceControlMessage = {
  t: number;
  utc: string;
  lap: number | null;
  category: string;
  message: string;
  flag?: string;
  scope?: string;
  sector?: number;
  racingNumber?: DriverNumber;
  /** Safety car messages: "DEPLOYED", "ENDING", ... */
  status?: string;
  /** Safety car messages: "SAFETY CAR" or "VIRTUAL SAFETY CAR". */
  mode?: string;
};

export type SessionState = {
  lap: number;
  totalLaps: number;
  trackStatus: TrackStatus;
  sessionStatus: SessionStatus;
  weather: Weather | null;
  drivers: Record<DriverNumber, DriverState>;
  /** Keyed by message index ("0", "1", ...), in order. */
  raceControl: Record<string, RaceControlMessage>;
};

/**
 * A change to SessionState. Objects merge key by key; arrays, primitives and null replace the old
 * value. Nothing is ever deleted, and objects in the state always have the same keys, so merging
 * never leaves stale fields behind.
 */
export type Patch = DeepPartial<SessionState>;
export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/** Car positions at one moment, in 1/10 m in the circuit's coordinate system. */
export type PositionFrame = { t: number; cars: Record<DriverNumber, [x: number, y: number]> };

// ---------- WebSocket messages ----------

export type SnapshotMessage = {
  type: "snapshot";
  /** Where this viewer is in the timeline (liveT - delayMs). */
  t: number;
  /** The live edge. */
  liveT: number;
  delayMs: number;
  state: SessionState;
};

export type UpdateMessage = {
  type: "update";
  t: number;
  liveT: number;
  patch?: Patch;
  positions?: PositionFrame[];
};

export type ErrorMessage = { type: "error"; message: string };

export type ServerMessage = SnapshotMessage | UpdateMessage | ErrorMessage;

export type ClientMessage =
  | { type: "setDelay"; delayMs: number }
  /** The viewer saw the leader start `leaderLap` on their stream just now. */
  | { type: "syncTap"; leaderLap: number };

export const MAX_DELAY_MS = 90_000;

// ---------- Static data (REST) ----------

export type Point = [x: number, y: number];

export type Circuit = {
  id: string;
  name: string;
  /** Degrees to rotate the outline by for display. */
  rotation: number;
  /** Track outline in the same coordinate system as PositionFrame. */
  outline: Point[];
  corners: { number: number; x: number; y: number; angle: number }[];
  marshalSectors: { number: number; x: number; y: number }[];
  /** Where S1, S2 and S3 end (S3 ends at the finish line). */
  sectorEnds: Point[];
};

export type SeasonDriver = { code: string; firstName: string; lastName: string; number: string | null };

export type SeasonSession = { type: "FP1" | "FP2" | "FP3" | "SprintQualifying" | "Sprint" | "Qualifying" | "Race"; startUtc: string };

export type Round = {
  round: number;
  name: string;
  circuit: string;
  locality: string;
  country: string;
  /**
   * F1-style three-letter country code, e.g. "BEL", "MON", "NED", "UAE". Not ISO 3166: taken from
   * OpenF1 as is (round 16, the Bahrain Grand Prix held in Malaysia, has "BRN"). null if unknown.
   */
  countryCode: string | null;
  sessions: SeasonSession[];
};

export type DriverStanding = {
  position: number;
  points: number;
  wins: number;
  driver: SeasonDriver;
  team: string;
  teamColour: string | null;
};

export type ConstructorStanding = {
  position: number;
  points: number;
  wins: number;
  team: string;
  teamColour: string | null;
};

export type ResultEntry = {
  position: number | null;
  driver: SeasonDriver;
  team: string;
  teamColour: string | null;
  /**
   * Race/sprint: the winner's race time, then the gap to the winner, e.g. "1:25:01.123", "+5.432",
   * "+1:02.677"; cars that finished laps down have "+1 Lap", "+2 Laps". null for drivers who didn't
   * finish, even when classified (see `status`).
   * Practice: the driver's best lap, e.g. "1:47.070". Qualifying and sprint qualifying: the
   * driver's lap from the last segment they reached (Q3, else Q2, else Q1), which isn't
   * necessarily their best of the session.
   */
  time: string | null;
  /**
   * Practice: gap to the fastest driver, e.g. "+0.145". Qualifying and sprint qualifying: gap to
   * the fastest driver in the final segment (Q3, SQ3), only for drivers who set a time in it;
   * drivers knocked out earlier have null. null for the leader, drivers without a time, and race
   * and sprint results.
   */
  gap: string | null;
  points: number | null;
  status: string | null;
  grid: number | null;
};

export type RoundResults = {
  fp1?: ResultEntry[];
  fp2?: ResultEntry[];
  fp3?: ResultEntry[];
  sprintQualifying?: ResultEntry[];
  sprint?: ResultEntry[];
  qualifying?: ResultEntry[];
  race?: ResultEntry[];
};

export type Season = {
  year: number;
  /**
   * Standings and race/sprint results include rounds up to and including this one.
   * `results[asOfRound + 1]` may also hold that weekend's pre-race sessions (practice, sprint
   * qualifying, qualifying).
   */
  asOfRound: number;
  schedule: Round[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  /** Keyed by round number. */
  results: Record<string, RoundResults>;
};
