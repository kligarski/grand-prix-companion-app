import Storage from "expo-sqlite/kv-store";

import type { ThemePreference } from "@/theme";

export type Preferences = {
  version: 1;
  /** Three-letter code of the favourite driver, e.g. "VER". null when none was picked. */
  favouriteDriverCode: string | null;
  /** Whether onboarding was finished, with or without a favourite. */
  onboardingDone: boolean;
  /** Whether results and standings are shown without a blur. */
  showSpoilers: boolean;
  appearance: ThemePreference;
};

export const DEFAULT_PREFERENCES: Preferences = {
  version: 1,
  favouriteDriverCode: null,
  onboardingDone: false,
  showSpoilers: true,
  appearance: "system",
};

const KEY = "preferences";
const APPEARANCES: readonly ThemePreference[] = ["system", "light", "dark"];

/** Keeps each stored field that has the right type and falls back to the default for the rest. */
function parse(value: unknown): Preferences {
  if (typeof value !== "object" || value === null) return DEFAULT_PREFERENCES;
  const stored = value as Partial<Record<keyof Preferences, unknown>>;
  const defaults = DEFAULT_PREFERENCES;
  return {
    version: 1,
    favouriteDriverCode:
      typeof stored.favouriteDriverCode === "string" ? stored.favouriteDriverCode : defaults.favouriteDriverCode,
    onboardingDone: typeof stored.onboardingDone === "boolean" ? stored.onboardingDone : defaults.onboardingDone,
    showSpoilers: typeof stored.showSpoilers === "boolean" ? stored.showSpoilers : defaults.showSpoilers,
    appearance: APPEARANCES.find((appearance) => appearance === stored.appearance) ?? defaults.appearance,
  };
}

/** Reads the stored preferences synchronously, so the first render already has them. */
export function readPreferences(): Preferences {
  try {
    const json = Storage.getItemSync(KEY);
    return json ? parse(JSON.parse(json)) : DEFAULT_PREFERENCES;
  } catch (error) {
    console.warn("Couldn't read preferences, using the defaults", error);
    return DEFAULT_PREFERENCES;
  }
}

export function writePreferences(preferences: Preferences) {
  try {
    Storage.setItemSync(KEY, JSON.stringify(preferences));
  } catch (error) {
    console.warn("Couldn't save preferences", error);
  }
}

export function clearPreferences() {
  try {
    Storage.removeItemSync(KEY);
  } catch (error) {
    console.warn("Couldn't clear preferences", error);
  }
}
