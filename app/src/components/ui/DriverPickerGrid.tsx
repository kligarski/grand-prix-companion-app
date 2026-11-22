import { Platform, Pressable, StyleSheet, View } from "react-native";

import { createThemedStyles, radii, SLANT, spacing } from "@/theme";

import { AppText } from "./AppText";
import { Icon } from "./Icon";

export type DriverPickerItem = {
  /** Three-letter code, e.g. "VER". */
  code: string;
  /** Short name, e.g. "M. Verstappen". */
  name: string;
  team: string;
  teamColor: string;
};

type Props = {
  drivers: readonly DriverPickerItem[];
  selectedCode?: string | null;
  onSelect: (code: string) => void;
};

const COLUMNS = 2;

function rowsOf<T>(items: readonly T[]) {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += COLUMNS) rows.push(items.slice(index, index + COLUMNS));
  return rows;
}

type TileProps = {
  driver: DriverPickerItem;
  selected: boolean;
  onSelect: (code: string) => void;
};

function DriverTile({ driver, selected, onSelect }: TileProps) {
  const styles = useStyles();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${driver.code}, ${driver.name}, ${driver.team}`}
      onPress={() => onSelect(driver.code)}
      style={({ pressed }) => [styles.tile, selected && styles.tileSelected, pressed && styles.pressed]}
    >
      <View style={[styles.stripe, { backgroundColor: driver.teamColor }]} />
      <View style={styles.text}>
        <AppText variant="headline" color={selected ? "onHighlight" : "text"}>
          {driver.code}
        </AppText>
        <AppText variant="footnote" color={selected ? "onHighlightSecondary" : "textSecondary"} numberOfLines={2}>
          {`${driver.name} · ${driver.team}`}
        </AppText>
      </View>
      {selected ? (
        Platform.OS === "ios" ? (
          <View style={styles.checkCircle}>
            <Icon name="check" size={14} color="highlight" />
          </View>
        ) : (
          <Icon name="check" color="onHighlight" />
        )
      ) : null}
    </Pressable>
  );
}

/** Two-column grid of drivers to pick a favourite from. The selected tile is inverted with a check mark. */
export function DriverPickerGrid({ drivers, selectedCode, onSelect }: Props) {
  return (
    <View accessibilityRole="radiogroup" style={layout.grid}>
      {rowsOf(drivers).map((row) => (
        <View key={row[0].code} style={layout.row}>
          {row.map((driver) => (
            <DriverTile key={driver.code} driver={driver} selected={driver.code === selectedCode} onSelect={onSelect} />
          ))}
          {row.length < COLUMNS ? <View style={layout.empty} /> : null}
        </View>
      ))}
    </View>
  );
}

const CHECK_SIZE = 24;

const layout = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
  },
});

const useStyles = createThemedStyles(({ colors }) => ({
  tile: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 72,
    paddingVertical: spacing.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    borderRadius: radii.md,
    borderCurve: "continuous",
    overflow: "hidden",
    backgroundColor: colors.tile,
  },
  tileSelected: {
    backgroundColor: colors.highlight,
  },
  pressed: {
    opacity: 0.8,
  },
  stripe: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: -spacing.sm,
    width: spacing.md + spacing.xxs,
    transform: [{ skewX: SLANT }],
  },
  text: {
    flex: 1,
  },
  checkCircle: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.onHighlight,
  },
}));
