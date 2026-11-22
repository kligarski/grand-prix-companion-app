import { createContext, use, useLayoutEffect, type ReactNode } from "react";
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
  /** The stored Appearance preference. */
  preference: ThemePreference;
  /** Called by `setPreference`, e.g. to persist the new preference. */
  onPreferenceChange: (preference: ThemePreference) => void;
};

/** Controlled: the preference lives with the other stored preferences, not here. */
export function ThemeProvider({ children, preference, onPreferenceChange }: Props) {
  // Native chrome (headers, the status bar, SwiftUI and Compose views) reads the app-wide override,
  // so set it as early as possible. The native setters are async, so this narrows the window for a
  // wrong-scheme frame rather than ruling it out.
  useLayoutEffect(() => {
    Appearance.setColorScheme(preference === "system" ? "auto" : preference);
  }, [preference]);

  const systemScheme = useColorScheme();
  const scheme: ColorScheme = preference === "system" ? (systemScheme === "light" ? "light" : "dark") : preference;

  const theme: Theme = {
    scheme,
    colors: scheme === "dark" ? darkColors : lightColors,
    preference,
    setPreference: onPreferenceChange,
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
