import { Platform, Pressable, StyleSheet } from "react-native";

import { spacing } from "@/theme";

import { AppText } from "./AppText";
import { Icon } from "./Icon";

type Props = {
  label: string;
  onPress: () => void;
  /** What screen readers read, when `label` alone is ambiguous, e.g. "Full driver standings". */
  accessibilityLabel?: string;
};

/**
 * A link row at the bottom of a card, e.g. "Full results ›". iOS puts the chevron at the trailing edge,
 * like a table row; Android keeps it next to the label, as in the designs.
 */
export function CardLink({ label, onPress, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <AppText variant="callout" color="link">
        {label}
      </AppText>
      <Icon name="chevronRight" size={14} color="link" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingTop: spacing.xs,
    // iOS: the whole row is the link. Android: only the label and chevron.
    ...Platform.select({ ios: { justifyContent: "space-between" }, default: { alignSelf: "flex-start" } }),
  },
  pressed: {
    opacity: 0.6,
  },
});
