import { createContext, use, useLayoutEffect, useState, type ReactNode } from "react";
import { Appearance, useColorScheme } from "react-native";

import { darkColors, lightColors, type ColorTokens } from "./colors";

export type ThemePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export type Theme = {
  scheme: ColorScheme;
  colors: ColorTokens;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<Theme | null>(null);

type Props = {
  children: ReactNode;
  /** The starting preference when uncontrolled (no `preference` prop). */
  initialPreference?: ThemePreference;
  /** Makes the provider controlled: the preference comes from here, e.g. persisted preferences. */
  preference?: ThemePreference;
  /** Called by `setPreference` when controlled. */
  onPreferenceChange?: (preference: ThemePreference) => void;
};

export function ThemeProvider({
  children,
  initialPreference = "system",
  preference: controlledPreference,
  onPreferenceChange,
}: Props) {
  const [internalPreference, setInternalPreference] = useState<ThemePreference>(initialPreference);
  const preference = controlledPreference ?? internalPreference;
  const setPreference = (next: ThemePreference) => {
    if (controlledPreference === undefined) setInternalPreference(next);
    onPreferenceChange?.(next);
  };

  // Native chrome (headers, the status bar, SwiftUI and Compose views) reads the app-wide override,
  // so set it before the first paint: a stored "light" on a dark system never shows a dark frame.
  useLayoutEffect(() => {
    Appearance.setColorScheme(preference === "system" ? "auto" : preference);
  }, [preference]);

  const systemScheme = useColorScheme();
  const scheme: ColorScheme = preference === "system" ? (systemScheme === "light" ? "light" : "dark") : preference;

  const theme: Theme = {
    scheme,
    colors: scheme === "dark" ? darkColors : lightColors,
    preference,
    setPreference,
  };

  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export function useTheme(): Theme {
  const theme = use(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }
  return theme;
}
