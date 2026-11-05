import { View } from "react-native";

import { AppText } from "@/components/ui";
import { createThemedStyles } from "@/theme";

export function PlaceholderScreen({ title }: { title: string }) {
  const styles = useStyles();
  return (
    <View style={styles.container}>
      <AppText variant="title">{title}</AppText>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
}));
