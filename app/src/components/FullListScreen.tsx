import type { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "@/components/ui";
import { spacing } from "@/theme";

// iOS insets the scroll view for the home indicator (`contentInsetAdjustmentBehavior`). Android draws
// edge to edge with no such inset, so the end of the list needs the navigation bar's height.
const BOTTOM_EDGES = Platform.OS === "android" ? (["bottom"] as const) : ([] as const);

/** A pushed screen with one card holding a whole list, e.g. the full standings. */
export function FullListScreen({ children }: { children: ReactNode }) {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <SafeAreaView edges={BOTTOM_EDGES}>
        <Card>{children}</Card>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
});
