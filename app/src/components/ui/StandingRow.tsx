import { View } from "react-native";

import { createThemedStyles, radii, spacing } from "@/theme";

import { AppText } from "./AppText";
import { TeamStripe } from "./TeamStripe";

type Props = {
  position: number;
  title: string;
  subtitle?: string;
  teamColor: string;
  points: number;
  isFavourite?: boolean;
};

/** Championship standings row (drivers or constructors). */
export function StandingRow({ position, title, subtitle, teamColor, points, isFavourite = false }: Props) {
  const styles = useStyles();
  const textColor = isFavourite ? "onHighlight" : "text";
  const secondaryColor = isFavourite ? "onHighlightSecondary" : "textSecondary";

  return (
    <View style={[styles.row, isFavourite && styles.rowFavourite]}>
      <AppText variant="headline" color={isFavourite ? textColor : "link"} tabular style={styles.position}>
        {position}
      </AppText>
      <TeamStripe color={teamColor} />
      <View style={styles.titles}>
        <AppText variant="bodyStrong" color={textColor} numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="footnote" color={secondaryColor} numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <View style={styles.points}>
        <AppText variant="headline" color={textColor} tabular>
          {points}
        </AppText>
        <AppText variant="footnote" color={secondaryColor}>
          pts
        </AppText>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  rowFavourite: {
    backgroundColor: colors.highlight,
  },
  position: {
    minWidth: spacing.xxl,
  },
  titles: {
    flex: 1,
  },
  points: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
}));
