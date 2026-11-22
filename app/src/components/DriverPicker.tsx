import { Button as UIButton, Host } from "@expo/ui";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { driverPickerItems } from "@/api/drivers";
import { useSessionData } from "@/api/LiveSessionProvider";
import { AppText, DriverPickerGrid } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

type Props = {
  selectedCode: string | null;
  onSelect: (code: string) => void;
};

/**
 * The session's drivers as a `DriverPickerGrid` in championship order, or a spinner while they load,
 * or an error with Retry. Falls back to feed order only when the season fails to load.
 */
export function DriverPicker({ selectedCode, onSelect }: Props) {
  const { scheme, colors } = useTheme();
  const { session, season, sessionError, seasonError, loading, reload } = useSessionData();

  if (!session && sessionError && !loading) {
    return (
      <View style={styles.status}>
        <AppText variant="callout" color="textSecondary" style={styles.message}>
          {"Can't load the drivers. Check your connection and try again."}
        </AppText>
        <Host matchContents colorScheme={scheme}>
          <UIButton label="Retry" variant="outlined" onPress={reload} />
        </Host>
      </View>
    );
  }

  // Wait for the season too, so the grid doesn't show in feed order and then reorder.
  if (!session || (!season && !seasonError && loading)) {
    return (
      <View style={styles.status}>
        <ActivityIndicator color={colors.textSecondary} accessibilityLabel="Loading drivers" />
      </View>
    );
  }

  return (
    <>
      {season ? (
        <AppText variant="footnote" color="textSecondary">
          In championship order
        </AppText>
      ) : null}
      <DriverPickerGrid drivers={driverPickerItems(session, season)} selectedCode={selectedCode} onSelect={onSelect} />
    </>
  );
}

const styles = StyleSheet.create({
  status: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  message: {
    textAlign: "center",
  },
});
