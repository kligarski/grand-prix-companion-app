import { BlurTargetView, BlurView } from "expo-blur";
import { useRef, useState, type ComponentRef, type ReactNode } from "react";
import { AccessibilityInfo, Platform, Pressable, StyleSheet, View } from "react-native";

import { AppText, Icon } from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { createThemedStyles, radii, spacing, useTheme, type ColorTokens } from "@/theme";

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

// `dimezisBlurViewSdk31Plus` only blurs on Android 12 (API 31) and newer. Older versions fall back to
// a translucent tint that leaves the rows readable, so they get an opaque scrim instead.
const CAN_BLUR = !(Platform.OS === "android" && Platform.Version < 31);

type Props = {
  hidden: boolean;
  onReveal: () => void;
  /** What VoiceOver and TalkBack read for the blurred content, e.g. "Reveal driver standings". */
  revealLabel: string;
  /** What VoiceOver and TalkBack announce after a reveal, e.g. "Driver standings revealed". */
  revealedAnnouncement: string;
  /**
   * The colour behind `children`, i.e. the card's. Android blurs a snapshot of the content in which
   * transparent pixels come out dark grey, so the content needs an opaque background.
   */
  background?: keyof ColorTokens;
  children: ReactNode;
};

/** Blurs `children` while `hidden`, with "Tap to reveal" over them. Meant for content on a `Card`. */
export function SpoilerBlur({
  hidden,
  onReveal,
  revealLabel,
  revealedAnnouncement,
  background = "surface",
  children,
}: Props) {
  const { scheme } = useTheme();
  const styles = useStyles();
  const backgrounds = useBackgrounds();
  const target = useRef<ComponentRef<typeof View>>(null);

  const reveal = () => {
    onReveal();
    // The focused "Tap to reveal" button goes away, so tell screen reader users what happened. `queue`
    // (iOS) lets VoiceOver finish reading the element it moves to instead of cutting this off.
    AccessibilityInfo.announceForAccessibilityWithOptions(revealedAnnouncement, { queue: true });
  };

  const overlay = (
    <Pressable accessibilityRole="button" accessibilityLabel={revealLabel} onPress={reveal} style={styles.overlay}>
      <Icon name="eye" size={18} />
      <AppText variant="callout">Tap to reveal</AppText>
    </Pressable>
  );

  return (
    <View style={styles.clip}>
      <BlurTargetView ref={target}>
        {/* A background on BlurTargetView itself isn't drawn, hence the inner view. */}
        <View
          style={backgrounds[background]}
          accessibilityElementsHidden={hidden}
          importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
        >
          {children}
        </View>
      </BlurTargetView>
      {hidden && CAN_BLUR ? (
        <BlurView
          blurTarget={target}
          blurMethod="dimezisBlurViewSdk31Plus"
          intensity={INTENSITY}
          tint={scheme}
          style={StyleSheet.absoluteFill}
        >
          {overlay}
        </BlurView>
      ) : null}
      {hidden && !CAN_BLUR ? <View style={[StyleSheet.absoluteFill, styles.scrim]}>{overlay}</View> : null}
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
  scrim: {
    backgroundColor: colors.spoilerScrim,
  },
}));

const useBackgrounds = createThemedStyles(
  ({ colors }) =>
    Object.fromEntries(Object.entries(colors).map(([token, value]) => [token, { backgroundColor: value }])) as Record<
      keyof ColorTokens,
      { backgroundColor: string }
    >,
);
