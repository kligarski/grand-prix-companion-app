import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/theme";

import { DriverRow } from "./DriverRow";
import { topWithFavourite } from "./topWithFavourite";
import { TyreBadge, type TyreCompound } from "./TyreBadge";

export type DriverTableEntry = {
  position: number;
  code: string;
  name?: string;
  teamColor: string;
  value?: string;
  tyre?: TyreCompound;
};

type Props = {
  entries: readonly DriverTableEntry[];
  favouriteCode?: string;
  limit?: number;
  showNames?: boolean;
  expandedCode?: string;
  onEntryPress?: (entry: DriverTableEntry) => void;
  renderDetails?: (entry: DriverTableEntry) => ReactNode;
};

export function DriverTable({
  entries,
  favouriteCode,
  limit,
  showNames = false,
  expandedCode,
  onEntryPress,
  renderDetails,
}: Props) {
  const visible = topWithFavourite(entries, limit, (entry) => entry.code === favouriteCode);

  return (
    <View style={styles.table}>
      {visible.map((entry) => (
        <DriverRow
          key={entry.code}
          position={entry.position}
          code={entry.code}
          name={showNames ? entry.name : undefined}
          teamColor={entry.teamColor}
          value={entry.value}
          trailing={entry.tyre ? <TyreBadge compound={entry.tyre} /> : undefined}
          isFavourite={entry.code === favouriteCode}
          onPress={onEntryPress ? () => onEntryPress(entry) : undefined}
        >
          {renderDetails && entry.code === expandedCode ? renderDetails(entry) : null}
        </DriverRow>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    gap: spacing.sm,
  },
});
