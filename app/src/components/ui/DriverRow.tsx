import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { createThemedStyles, radii, spacing } from "@/theme";

import { AppText } from "./AppText";
import { PositionBadge } from "./PositionBadge";
import { TeamStripe } from "./TeamStripe";

type Props = {
  position: number;
  /** Three-letter code, e.g. "VER". */
  code: string;
  /** Optional name shown after the code, e.g. "Verstappen". */
  name?: string;
  teamColor: string;
  /** Lap time, gap or interval on the right, e.g. "1:29.884", "+0.118", "LEADER". */
  value?: string;
  /** Extra content after the value, e.g. a tyre badge. */
  trailing?: ReactNode;
  isFavourite?: boolean;
  favouriteLabel?: string;
  onPress?: () => void;
  /** Expanded details shown under the row (timing sector breakdown). */
  children?: ReactNode;
};

export function DriverRow({
  position,
  code,
  name,
  teamColor,
  value,
  trailing,
  isFavourite = false,
  favouriteLabel = "your driver",
  onPress,
  children,
}: Props) {
  const styles = useStyles();
  const textColor = isFavourite ? "onHighlight" : "text";
  const secondaryColor = isFavourite ? "onHighlightSecondary" : "textSecondary";
  const subtitle = [name, isFavourite ? favouriteLabel : null].filter(Boolean).join(" · ");
  const containerStyle = [styles.container, isFavourite && styles.containerFavourite];

  const content = (
    <>
      <View style={styles.header}>
        <PositionBadge position={position} rounded={false} />
        <View style={styles.headerContent}>
          <TeamStripe color={teamColor} />
          <AppText variant="headline" color={textColor}>
            {code}
          </AppText>
          {subtitle ? (
            <AppText variant="callout" color={secondaryColor} numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </AppText>
          ) : null}
          <View style={styles.spacer} />
          {value ? (
            <AppText variant="headline" color={textColor} tabular>
              {value}
            </AppText>
          ) : null}
          {trailing}
        </View>
      </View>
      {children ? <View style={styles.details}>{children}</View> : null}
    </>
  );

  if (!onPress) {
    return (
      <View accessible style={containerStyle}>
        {content}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [containerStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceElevated,
  },
  containerFavourite: {
    backgroundColor: colors.highlight,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    flexShrink: 1,
  },
  spacer: {
    flex: 1,
  },
  details: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
}));
