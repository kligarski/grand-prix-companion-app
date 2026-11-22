import { ExperimentalStack as Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";

import { LiveSessionProvider } from "@/api/LiveSessionProvider";
import { PreferencesProvider, usePreferences } from "@/preferences/PreferencesProvider";
import { ThemeProvider, useTheme } from "@/theme";

// A deep link opened on a cold start (e.g. `/results/10/qualifying`) lands on top of the dashboard,
// so back returns to it instead of leaving the app.
export const unstable_settings = { anchor: "index" };

function RootStack() {
  const { colors } = useTheme();
  const { onboardingDone } = usePreferences();

  // Group order matters: while the app screens are blocked, the first screen left must be
  // onboarding, not a dev screen. Flipping `onboardingDone` swaps one group for the other, so
  // there is no way back to onboarding once it's done.
  // On a fresh install the first frame is the blocked `index` rendering the redirect, and the
  // redirect swaps onboarding into that same native screen. Hiding the header while onboarding is
  // pending keeps an empty header from showing before onboarding appears.
  const headerShown = onboardingDone;
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={onboardingDone} redirectTo="/onboarding">
        <Stack.Screen name="index" options={{ title: "", headerShown }} />
        <Stack.Screen name="live" options={{ title: "", headerShown }} />
        <Stack.Screen name="settings" options={{ title: "Settings", headerShown }} />
        <Stack.Screen name="favourite-driver" options={{ title: "Favourite driver", headerShown }} />
        <Stack.Screen name="standings/[kind]" options={{ title: "", headerShown }} />
        <Stack.Screen name="results/[round]/[session]" options={{ title: "", headerShown }} />
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

/** The status bar follows the app's scheme, which may override the system one. */
function ThemedStatusBar() {
  const { scheme } = useTheme();
  return <StatusBar style={scheme === "dark" ? "light" : "dark"} />;
}

/** The theme follows the stored Appearance preference, read before the first render. */
function ThemedRoot({ children }: { children: ReactNode }) {
  const { appearance, setAppearance } = usePreferences();
  return (
    <ThemeProvider preference={appearance} onPreferenceChange={setAppearance}>
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PreferencesProvider>
      <ThemedRoot>
        <LiveSessionProvider>
          <ThemedStatusBar />
          <RootStack />
        </LiveSessionProvider>
      </ThemedRoot>
    </PreferencesProvider>
  );
}
