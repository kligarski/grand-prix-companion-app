import { BlurTargetView, BlurView } from "expo-blur";
import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";

import { AppText, Icon } from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { createThemedStyles, radii, spacing, useTheme } from "@/theme";

/**
 * Whether a spoiler is hidden: spoilers are off and the user hasn't tapped to reveal it. Turning the
 * Spoilers switch hides it again.
 */
export function useSpoilerReveal() {
  const { showSpoilers } = usePreferences();
  const [revealed, setRevealed] = useState(false);
  const [previousShowSpoilers, setPreviousShowSpoilers] = useState(showSpoilers);

  if (showSpoilers !== previousShowSpoilers) {
    setPreviousShowSpoilers(showSpoilers);
    setRevealed(false);
  }

  return { hidden: !showSpoilers && !revealed, reveal: () => setRevealed(true) };
}

// Strong enough that names and numbers can't be read. Android divides its intensity by
// `blurReductionFactor` (4 by default).
const INTENSITY = Platform.select({ android: 60, default: 30 });

type Props = {
  hidden: boolean;
  onReveal: () => void;
  /** What VoiceOver and TalkBack read for the blurred content, e.g. "Reveal driver standings". */
  revealLabel: string;
  children: ReactNode;
};

/** Blurs `children` while `hidden`, with "Tap to reveal" over them. Meant for content on a `Card`. */
export function SpoilerBlur({ hidden, onReveal, revealLabel, children }: Props) {
  const { scheme } = useTheme();
  const styles = useStyles();
  const target = useRef<ComponentRef<typeof View>>(null);

  return (
    <View style={styles.clip}>
      <BlurTargetView ref={target}>
        <View
          style={styles.target}
          accessibilityElementsHidden={hidden}
          importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
        >
          {children}
        </View>
      </BlurTargetView>
      {hidden ? (
        <BlurView
          blurTarget={target}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={INTENSITY}
          tint={scheme}
          style={StyleSheet.absoluteFill}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealLabel}
            onPress={onReveal}
            style={styles.overlay}
          >
            <Icon name="eye" size={18} />
            <AppText variant="callout">Tap to reveal</AppText>
          </Pressable>
        </BlurView>
      ) : null}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  clip: {
    overflow: "hidden",
    borderRadius: radii.md,
  },
  overlay: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  // Android blurs a snapshot of the target in which transparent pixels come out dark grey, so the
  // rows get the card's colour behind them. (A background on BlurTargetView itself isn't drawn.)
  target: {
    backgroundColor: colors.surface,
  },
}));
