import { createContext, use, useEffect, useState, type ReactNode } from "react";
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
  initialPreference?: ThemePreference;
};

export function ThemeProvider({ children, initialPreference = "system" }: Props) {
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);

  useEffect(() => {
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
