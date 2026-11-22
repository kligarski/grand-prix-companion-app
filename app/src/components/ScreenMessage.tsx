import { Button, Host } from "@expo/ui";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useSessionData } from "@/api/LiveSessionProvider";
import { AppText } from "@/components/ui";
import { spacing, useTheme } from "@/theme";

type Props = {
  /** A short line, e.g. "No results for this session". */
  message: string;
  /** Shows a spinner above the message, e.g. "Loading…". */
  loading?: boolean;
  /** Shows a native Retry button below the message. */
  onRetry?: () => void;
};

/**
 * A short centred message filling a screen: a placeholder, a not-found or error message, or a loading
 * state. The stack's `contentStyle` paints the background.
 */
export function ScreenMessage({ message, loading, onRetry }: Props) {
  const { colors, scheme } = useTheme();
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator color={colors.textSecondary} /> : null}
      <AppText variant="callout" color="textSecondary" style={styles.text}>
        {message}
      </AppText>
      {onRetry ? (
        <Host matchContents colorScheme={scheme}>
          <Button label="Retry" variant="outlined" onPress={onRetry} />
        </Host>
      ) : null}
    </View>
  );
}

/**
 * What a screen that needs the season shows until it loads: a spinner, or `errorMessage` with Retry.
 * The error stays while retrying, so `loading` decides between the two.
 */
export function SeasonPendingMessage({ errorMessage }: { errorMessage: string }) {
  const { seasonError, loading, reload } = useSessionData();
  return seasonError && !loading ? (
    <ScreenMessage message={errorMessage} onRetry={reload} />
  ) : (
    <ScreenMessage message="Loading…" loading />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  text: {
    textAlign: "center",
  },
});
