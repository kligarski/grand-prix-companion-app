import { FilterChip, Host, Text } from "@expo/ui/jetpack-compose";
import { semantics } from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useRef, type ComponentRef } from "react";
import { Platform, Pressable, ScrollView, View, type LayoutChangeEvent, type LayoutRectangle } from "react-native";

import { createThemedStyles, radii, spacing, useTheme } from "@/theme";

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

type ChipProps = RoundChip & {
  selected: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
};

/** iOS: a drawn tile with the round number over the code. */
function TileChip({ round, code, name, selected, onPress, onLayout }: ChipProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Round ${round}, ${name}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      onLayout={onLayout}
      style={({ pressed }) => [styles.tile, selected && styles.tileSelected, pressed && !selected && styles.tilePressed]}
    >
      <AppText variant="headline" color={selected ? "onPrimary" : "text"} tabular>
        {round}
      </AppText>
      {code ? (
        <AppText variant="caption" color={selected ? "onPrimary" : "textSecondary"} numberOfLines={1}>
          {code}
        </AppText>
      ) : null}
    </Pressable>
  );
}

/**
 * Android: a Material outlined filter chip, "11 MAR", as in the design. Selected fills with the
 * elevated surface (no check mark, like the design); the label keeps the text colour in both schemes.
 */
function FilterRoundChip({ round, code, name, selected, onPress, onLayout }: ChipProps) {
  const { scheme, colors } = useTheme();

  return (
    <View onLayout={onLayout}>
      <Host matchContents colorScheme={scheme}>
        <FilterChip
          selected={selected}
          onClick={onPress}
          colors={{
            labelColor: colors.text,
            selectedContainerColor: colors.surfaceElevated,
            selectedLabelColor: colors.text,
          }}
          border={{ color: selected ? colors.surfaceElevated : colors.border }}
          modifiers={[semantics({ contentDescription: `Round ${round}, ${name}` })]}
        >
          <FilterChip.Label>
            <Text maxLines={1} softWrap={false}>
              {code ? `${round} ${code}` : String(round)}
            </Text>
          </FilterChip.Label>
        </FilterChip>
      </Host>
    </View>
  );
}

const Chip = Platform.OS === "ios" ? TileChip : FilterRoundChip;

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
      {rounds.map((chip) => {
        const selected = chip.round === selectedRound;
        return (
          <Chip
            key={chip.round}
            {...chip}
            selected={selected}
            onPress={() => onSelect(chip.round)}
            onLayout={(event) => {
              chips.current.set(chip.round, event.nativeEvent.layout);
              if (selected) scrollToChip(chip.round, false);
            }}
          />
        );
      })}
    </ScrollView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  content: { gap: spacing.sm },
  tile: {
    minWidth: CHIP_MIN_WIDTH,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderCurve: "continuous",
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    gap: spacing.xxs,
  },
  tileSelected: { backgroundColor: colors.primary },
  tilePressed: { opacity: 0.7 },
}));
