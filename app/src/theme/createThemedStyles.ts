import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import type { ColorTokens } from "./colors";
import { useTheme, type ColorScheme } from "./ThemeProvider";

type StyleContext = { colors: ColorTokens; scheme: ColorScheme };
type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

export function createThemedStyles<T extends NamedStyles>(factory: (context: StyleContext) => T) {
  const cache = new Map<ColorScheme, Readonly<T>>();

  return function useThemedStyles(): Readonly<T> {
    const { colors, scheme } = useTheme();
    let styles = cache.get(scheme);
    if (!styles) {
      styles = StyleSheet.create(factory({ colors, scheme }));
      cache.set(scheme, styles);
    }
    return styles;
  };
}
