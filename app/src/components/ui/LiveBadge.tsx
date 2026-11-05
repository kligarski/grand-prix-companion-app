import { View } from "react-native";

import { createThemedStyles, spacing } from "@/theme";

import { AppText } from "./AppText";

type Props = {
  label?: string;
};

export function LiveBadge({ label = "LIVE" }: Props) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <AppText variant="label" color="live" style={styles.label}>
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
  label: {
    letterSpacing: 0.5,
  },
}));
