import { ExperimentalStack as Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemeProvider, useTheme } from "@/theme";

function RootStack() {
  const { colors } = useTheme();

  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" options={{ title: "" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="onboarding" options={{ title: "Onboarding" }} />
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="storybook" options={{ headerShown: false }} />
        <Stack.Screen name="server-test" options={{ title: "Server test" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <RootStack />
    </ThemeProvider>
  );
}
