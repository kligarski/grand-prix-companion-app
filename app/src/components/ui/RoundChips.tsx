import { useEffect, useRef, type ComponentRef } from "react";
import { Platform, Pressable, ScrollView, View, type LayoutRectangle } from "react-native";

import { createThemedStyles, radii, spacing } from "@/theme";

import { AppText } from "./AppText";

export type RoundChip = {
  round: number;
  /** Short country code, e.g. "BEL". The chip shows only the round number without one. */
  code: string | null;
  /** What screen readers read after the round number, e.g. "Belgian Grand Prix". */
  name: string;
};

type Props = {
  rounds: readonly RoundChip[];
  selectedRound: number;
  onSelect: (round: number) => void;
};

const CHIP_MIN_WIDTH = 56;

// iOS draws the round number over the code in a tile; Android a one-line outlined chip, "11 MAR".
const STACKED = Platform.OS === "ios";

/** A horizontal row of rounds to pick from. Keeps the selected round in view. */
export function RoundChips({ rounds, selectedRound, onSelect }: Props) {
  const styles = useStyles();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const width = useRef(0);
  const chips = useRef(new Map<number, LayoutRectangle>());

  const scrollToChip = (round: number, animated: boolean) => {
    const chip = chips.current.get(round);
    if (!chip || width.current === 0) return;
    scroll.current?.scrollTo({ x: Math.max(0, chip.x - (width.current - chip.width) / 2), animated });
  };

  // Another control (a schedule link) can change the round, so follow it.
  useEffect(() => {
    scrollToChip(selectedRound, true);
  }, [selectedRound]);

  return (
    <ScrollView
      ref={scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      onLayout={(event) => {
        width.current = event.nativeEvent.layout.width;
        scrollToChip(selectedRound, false);
      }}
    >
      {rounds.map(({ round, code, name }) => {
        const selected = round === selectedRound;
        const textColor = selected ? "onPrimary" : "text";

        return (
          <Pressable
            key={round}
            accessibilityRole="button"
            accessibilityLabel={`Round ${round}, ${name}`}
            accessibilityState={{ selected }}
            onPress={() => onSelect(round)}
            onLayout={(event) => {
              chips.current.set(round, event.nativeEvent.layout);
              if (selected) scrollToChip(round, false);
            }}
            style={({ pressed }) => [
              styles.chip,
              selected && styles.chipSelected,
              pressed && !selected && styles.chipPressed,
            ]}
          >
            {STACKED ? (
              <View style={styles.stack}>
                <AppText variant="headline" color={textColor} tabular>
                  {round}
                </AppText>
                {code ? (
                  <AppText variant="caption" color={selected ? "onPrimary" : "textSecondary"} numberOfLines={1}>
                    {code}
                  </AppText>
                ) : null}
              </View>
            ) : (
              <AppText variant="label" color={textColor} numberOfLines={1}>
                {code ? `${round} ${code}` : String(round)}
              </AppText>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ colors }) =>
  STACKED
    ? {
        content: { gap: spacing.sm },
        chip: {
          minWidth: CHIP_MIN_WIDTH,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.sm,
          borderRadius: radii.md,
          borderCurve: "continuous",
          backgroundColor: colors.surfaceElevated,
          alignItems: "center",
        },
        chipSelected: { backgroundColor: colors.primary },
        chipPressed: { opacity: 0.7 },
        stack: { alignItems: "center", gap: spacing.xxs },
      }
    : {
        content: { gap: spacing.sm },
        chip: {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: colors.border,
        },
        chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
        chipPressed: { backgroundColor: colors.surfaceElevated },
        stack: {},
      },
);
