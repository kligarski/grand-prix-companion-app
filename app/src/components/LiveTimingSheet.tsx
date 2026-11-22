import { BottomSheet, type Detent } from "@swmansion/react-native-bottom-sheet";
import { useRef, useState, type ComponentRef } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DriverTable, SectionHeader, type DriverTableEntry } from "@/components/ui";
import { createThemedStyles, radii, spacing } from "@/theme";

// Collapsed leaves the top of the screen for widgets and the track map; expanded fills the screen.
// No closed detent: timing is always visible. No `'content'` detent and no `lazy` either (a known
// iOS crash with that pair).
const DETENTS: Detent[] = ["45%", "100%"];
const COLLAPSED = 0;
const EXPANDED = 1;

// The list's end sits at the bottom of the screen when expanded, so its last row needs the home
// indicator's (iOS) or the navigation bar's (Android edge to edge) height below it.
const BOTTOM_EDGES = ["bottom"] as const;

const GRABBER = { width: 36, height: 5 };

type Props = {
  entries: readonly DriverTableEntry[];
  favouriteCode?: string;
};

/**
 * The live timing list in an inline bottom sheet. Drag it or tap the grabber to expand or collapse.
 * When expanded, the list scrolls; a drag up on the list expands the sheet first, and a drag down
 * that starts at the top of the list collapses it.
 */
export function LiveTimingSheet({ entries, favouriteCode }: Props) {
  const styles = useStyles();
  const [index, setIndex] = useState(COLLAPSED);
  const listRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const expanded = index === EXPANDED;

  // Collapsing goes back to the top of the order, so the collapsed sheet shows the leaders rather than
  // wherever the expanded list was scrolled to.
  const changeIndex = (next: number) => {
    setIndex(next);
    if (next === COLLAPSED) listRef.current?.scrollTo({ y: 0 });
  };

  return (
    <BottomSheet
      detents={DETENTS}
      index={index}
      onIndexChange={changeIndex}
      animateIn={false}
      surface={<View style={styles.surface} />}
      surfaceStyle={styles.surfaceShape}
    >
      {/* The grabber and the header are one toggle, so the tap target spans the sheet's top edge. */}
      <Pressable
        onPress={() => changeIndex(expanded ? COLLAPSED : EXPANDED)}
        accessibilityRole="button"
        accessibilityLabel="Timing"
        accessibilityHint={expanded ? "Collapses the timing list" : "Expands the timing list"}
        accessibilityState={{ expanded }}
        style={styles.toggle}
      >
        <View style={styles.grabberArea}>
          <View style={styles.grabber} />
        </View>
        <SectionHeader title="Timing" subtitle="Interval to car ahead" />
      </Pressable>
      <ScrollView ref={listRef} style={styles.list} contentContainerStyle={styles.listContent}>
        <SafeAreaView edges={BOTTOM_EDGES}>
          <DriverTable entries={entries} favouriteCode={favouriteCode} />
        </SafeAreaView>
      </ScrollView>
    </BottomSheet>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  surface: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.sheet,
  },
  surfaceShape: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderCurve: "continuous",
    // `boxShadow` only, on both platforms: the library draws it on iOS and on Android API 28+, where
    // it casts upwards like the iOS shadow. An Android `elevation` shadow falls mostly below the card,
    // so it barely shows above the sheet, and adding it on top of `boxShadow` drew two shadows.
    // Android below API 28 gets no shadow; the sheet's colour still sets it apart from the screen.
    boxShadow: `0 -4px 16px ${colors.sheetShadow}`,
  },
  toggle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  grabberArea: {
    alignItems: "center",
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  grabber: {
    width: GRABBER.width,
    height: GRABBER.height,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
}));
