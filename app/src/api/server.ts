import { Platform } from "react-native";

import type { Patch, SessionState } from "./protocol";

/**
 * Base URL of the companion server. Defaults to port 3000 on the dev machine: the iOS simulator
 * shares the Mac's network, the Android emulator reaches it at 10.0.2.2. Set
 * EXPO_PUBLIC_SERVER_URL (e.g. in .env.local) for a physical device or another port.
 */
export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ?? (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

export function websocketUrl(path: string) {
  return SERVER_URL.replace(/^http/, "ws") + path;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function merge(base: unknown, patch: unknown): unknown {
  if (!isObject(patch) || !isObject(base)) return patch;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) result[key] = merge(base[key], value);
  return result;
}

/** Objects merge key by key; arrays, primitives and null replace the old value. Same as the server. */
export function applyPatch(state: SessionState, patch: Patch): SessionState {
  return merge(state, patch) as SessionState;
}
