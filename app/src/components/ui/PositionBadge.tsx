import { View } from "react-native";

import { createThemedStyles, radii, SLANT } from "@/theme";

import { AppText } from "./AppText";

// tan(12deg) ≈ 0.21: how far the slanted edge leans over the badge height.
const LEAN = 0.21;
const leanFor = (height: number) => Math.ceil((height * LEAN) / 2);

const MD = { width: 44, height: 40 };
const LG = { width: 76, height: 60 };

type Props = {
  position: number | string;
  size?: "md" | "lg";
  rounded?: boolean;
};

export function PositionBadge({ position, size = "md", rounded = true }: Props) {
  const styles = useStyles();
  const large = size === "lg";

  return (
    <View style={[styles.container, large ? styles.containerLg : styles.containerMd, rounded && styles.rounded]}>
      <View style={[styles.fill, large ? styles.fillLg : styles.fillMd]} />
      <View style={[styles.label, large ? styles.labelLg : styles.labelMd]}>
        <AppText variant={large ? "title" : "headline"} color="onPrimary" tabular>
          {position}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    overflow: "hidden",
  },
  containerMd: MD,
  containerLg: LG,
  rounded: {
    borderTopLeftRadius: radii.md,
    borderBottomLeftRadius: radii.md,
  },
  fill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    transform: [{ skewX: SLANT }],
  },
  fillMd: { left: -leanFor(MD.height) * 2, right: leanFor(MD.height) },
  fillLg: { left: -leanFor(LG.height) * 2, right: leanFor(LG.height) },
  label: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  labelMd: { paddingRight: leanFor(MD.height) },
  labelLg: { paddingRight: leanFor(LG.height) },
}));
