import { View } from "react-native";

import { createThemedStyles, palette, radii, spacing } from "@/theme";

import { AppText } from "./AppText";

export type SectorStatus = "personalBest" | "sessionBest" | "none";

export type SectorSplit = {
  label: string;
  note: string;
  status: SectorStatus;
};

type Props = {
  sectors: readonly SectorSplit[];
};

export function SectorSplits({ sectors }: Props) {
  const styles = useStyles();

  return (
    <View style={styles.row}>
      {sectors.map((sector) => (
        <View key={sector.label} style={styles.sector}>
          <View style={[styles.bar, styles[sector.status]]} />
          <AppText variant="label" tabular>
            {sector.label}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {sector.note}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  sector: {
    flex: 1,
    gap: spacing.xs,
  },
  bar: {
    height: spacing.xs,
    borderRadius: radii.sm,
  },
  personalBest: {
    backgroundColor: palette.personalBest,
  },
  sessionBest: {
    backgroundColor: palette.sessionBest,
  },
  none: {
    backgroundColor: colors.border,
  },
}));
