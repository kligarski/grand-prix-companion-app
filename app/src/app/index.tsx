import { router } from "expo-router";
import { Button, View } from "react-native";

import { createThemedStyles } from "@/theme";

export default function Dashboard() {
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Button title="Live" onPress={() => router.push("/live")} />
      <Button title="Settings" onPress={() => router.push("/settings")} />
      <Button title="Onboarding" onPress={() => router.push("/onboarding")} />
      {__DEV__ ? <Button title="Storybook" onPress={() => router.push("/storybook")} /> : null}
      {__DEV__ ? <Button title="Server test" onPress={() => router.push("/server-test")} /> : null}
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
