import { View, type ViewProps } from "react-native";

import { createThemedStyles, radii, spacing } from "@/theme";

type Props = ViewProps & {
  variant?: "surface" | "elevated";
};

export function Card({ variant = "surface", style, ...rest }: Props) {
  const styles = useStyles();
  return <View style={[styles.card, variant === "elevated" && styles.elevated, style]} {...rest} />;
}

const useStyles = createThemedStyles(({ colors }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
  },
}));
