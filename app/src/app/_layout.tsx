import { ExperimentalStack as Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { LiveSessionProvider } from "@/api/LiveSessionProvider";
import { PreferencesProvider, usePreferences } from "@/preferences/PreferencesProvider";
import { ThemeProvider, useTheme } from "@/theme";

function RootStack() {
  const { colors } = useTheme();
  const { onboardingDone } = usePreferences();

  // Group order matters: while the app screens are blocked, the first screen left must be
  // onboarding, not a dev screen. Flipping `onboardingDone` swaps one group for the other, so
  // there is no way back to onboarding once it's done.
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={onboardingDone} redirectTo="/onboarding">
        <Stack.Screen name="index" options={{ title: "" }} />
        <Stack.Screen name="live" options={{ title: "" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
      </Stack.Protected>
      <Stack.Protected guard={!onboardingDone} redirectTo="/">
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="storybook" options={{ headerShown: false }} />
        <Stack.Screen name="server-test" options={{ title: "Server test" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <ThemeProvider>
        <LiveSessionProvider>
          <StatusBar style="auto" />
          <RootStack />
        </LiveSessionProvider>
      </ThemeProvider>
    </PreferencesProvider>
  );
}
