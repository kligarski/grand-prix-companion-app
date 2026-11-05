import { Fragment } from "react";
import { StyleSheet, View } from "react-native";

import { createThemedStyles } from "@/theme";

import { StandingRow } from "./StandingRow";
import { topWithFavourite } from "./topWithFavourite";

export type StandingsTableEntry = {
  id: string;
  position: number;
  title: string;
  subtitle?: string;
  teamColor: string;
  points: number;
};

type Props = {
  entries: readonly StandingsTableEntry[];
  favouriteId?: string;
  favouriteLabel?: string;
  limit?: number;
};

export function StandingsTable({ entries, favouriteId, favouriteLabel = "your driver", limit }: Props) {
  const styles = useStyles();
  const visible = topWithFavourite(entries, limit, (entry) => entry.id === favouriteId);

  return (
    <View>
      {visible.map((entry, index) => {
        const isFavourite = entry.id === favouriteId;
        const previousIsFavourite = index > 0 && visible[index - 1].id === favouriteId;
        const subtitle = isFavourite ? [entry.subtitle, favouriteLabel].filter(Boolean).join(" · ") : entry.subtitle;

        return (
          <Fragment key={entry.id}>
            {index > 0 && !isFavourite && !previousIsFavourite ? <View style={styles.separator} /> : null}
            <StandingRow
              position={entry.position}
              title={entry.title}
              subtitle={subtitle}
              teamColor={entry.teamColor}
              points={entry.points}
              isFavourite={isFavourite}
            />
          </Fragment>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
}));
