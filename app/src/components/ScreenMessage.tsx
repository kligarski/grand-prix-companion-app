import { View } from "react-native";

import { AppText } from "@/components/ui";
import { createThemedStyles, spacing } from "@/theme";

/** A short centred message filling a screen, e.g. "No results for this session". */
export function ScreenMessage({ message }: { message: string }) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <AppText variant="callout" color="textSecondary" style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  text: {
    textAlign: "center",
  },
}));
