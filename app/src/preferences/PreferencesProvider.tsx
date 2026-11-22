import { createContext, use, useState, type ReactNode } from "react";

import type { ThemePreference } from "@/theme";

import { clearPreferences, DEFAULT_PREFERENCES, readPreferences, writePreferences, type Preferences } from "./storage";

export type PreferencesContextValue = Preferences & {
  setFavouriteDriver: (code: string | null) => void;
  setShowSpoilers: (showSpoilers: boolean) => void;
  setAppearance: (appearance: ThemePreference) => void;
  /** Saves the favourite (null when skipped) and marks onboarding as done. */
  completeOnboarding: (code: string | null) => void;
  /** Clears the stored preferences, which brings back onboarding. */
  reset: () => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

/** Persisted user preferences. Read synchronously on mount, so the first screen is already the right one. */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);

  const update = (changes: Partial<Preferences>) => {
    const next = { ...preferences, ...changes };
    writePreferences(next);
    setPreferences(next);
  };

  const reset = () => {
    clearPreferences();
    setPreferences(DEFAULT_PREFERENCES);
  };

  return (
    <PreferencesContext
      value={{
        ...preferences,
        setFavouriteDriver: (favouriteDriverCode) => update({ favouriteDriverCode }),
        setShowSpoilers: (showSpoilers) => update({ showSpoilers }),
        setAppearance: (appearance) => update({ appearance }),
        completeOnboarding: (favouriteDriverCode) => update({ favouriteDriverCode, onboardingDone: true }),
        reset,
      }}
    >
      {children}
    </PreferencesContext>
  );
}

export function usePreferences(): PreferencesContextValue {
  const preferences = use(PreferencesContext);
  if (!preferences) {
    throw new Error("usePreferences must be used inside <PreferencesProvider>");
  }
  return preferences;
}
