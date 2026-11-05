import { View } from "react-native";

import { createThemedStyles, palette } from "@/theme";

import { AppText } from "./AppText";

export type TyreCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";

const LETTERS: Record<TyreCompound, string> = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
};

const SIZE = 26;

type Props = {
  compound: TyreCompound;
};

export function TyreBadge({ compound }: Props) {
  const styles = useStyles();

  return (
    <View
      accessible
      accessibilityLabel={`${compound.toLowerCase()} tyre`}
      style={[styles.badge, styles[`${compound}_ring`]]}
    >
      <AppText variant="badge" style={styles[`${compound}_text`]}>
        {LETTERS[compound]}
      </AppText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => {
  const tints: Record<TyreCompound, string> = {
    SOFT: palette.tyreSoft,
    MEDIUM: palette.tyreMedium,
    HARD: colors.text,
    INTERMEDIATE: palette.tyreIntermediate,
    WET: palette.tyreWet,
  };

  return {
    badge: {
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    SOFT_ring: { borderColor: tints.SOFT },
    SOFT_text: { color: tints.SOFT },
    MEDIUM_ring: { borderColor: tints.MEDIUM },
    MEDIUM_text: { color: tints.MEDIUM },
    HARD_ring: { borderColor: tints.HARD },
    HARD_text: { color: tints.HARD },
    INTERMEDIATE_ring: { borderColor: tints.INTERMEDIATE },
    INTERMEDIATE_text: { color: tints.INTERMEDIATE },
    WET_ring: { borderColor: tints.WET },
    WET_text: { color: tints.WET },
  };
});
