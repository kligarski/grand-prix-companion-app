import { StyleSheet, Text, type TextProps } from "react-native";

import { createThemedStyles, typography, type ColorTokens, type TypographyVariant } from "@/theme";

export type TextColor = keyof ColorTokens;

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  tabular?: boolean;
};

export function AppText({ variant = "body", color = "text", tabular, style, ...rest }: AppTextProps) {
  const colorStyles = useColorStyles();
  return <Text style={[typography[variant], colorStyles[color], tabular && styles.tabular, style]} {...rest} />;
}

const useColorStyles = createThemedStyles(
  ({ colors }) =>
    Object.fromEntries(Object.entries(colors).map(([token, value]) => [token, { color: value }])) as Record<
      TextColor,
      { color: string }
    >,
);

const styles = StyleSheet.create({
  tabular: { fontVariant: ["tabular-nums"] },
});
