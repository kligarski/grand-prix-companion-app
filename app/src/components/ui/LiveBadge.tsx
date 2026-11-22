import { View } from "react-native";

import { createThemedStyles, spacing } from "@/theme";

import { AppText } from "./AppText";

type Props = {
  label?: string;
  /** `neutral` is the grey variant for a session that isn't running, e.g. "FINISHED". */
  tone?: "live" | "neutral";
};

export function LiveBadge({ label = "LIVE", tone = "live" }: Props) {
  const styles = useStyles();
  const isLive = tone === "live";
  return (
    <View style={styles.container}>
      <View style={[styles.dot, !isLive && styles.dotNeutral]} />
      <AppText variant="label" color={isLive ? "live" : "textSecondary"} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.live,
  },
  dotNeutral: {
    backgroundColor: colors.textTertiary,
  },
  label: {
    letterSpacing: 0.5,
  },
}));
