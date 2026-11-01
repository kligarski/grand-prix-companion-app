import { Button, View, StyleSheet } from "react-native";
import { router } from "expo-router";

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <Button title="Live" onPress={() => router.push("/live")} />
      <Button title="Settings" onPress={() => router.push("/settings")} />
      <Button title="Onboarding" onPress={() => router.push("/onboarding")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
