import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { useLive, useSessionData } from "@/api/LiveSessionProvider";
import { toTimingEntries } from "@/api/timing";
import { LiveTimingSheet } from "@/components/LiveTimingSheet";
import { useScreenHeader } from "@/hooks/useScreenHeader";
import { usePreferences } from "@/preferences/PreferencesProvider";

// On iOS the screen's content runs under the native header, so the expanded sheet would slide under
// the navigation bar. The app's root safe area only covers the status bar; a provider inside the
// screen measures the screen's own safe area, which includes the navigation bar. A margin rather
// than padding, because the sheet fills its container absolutely and padding doesn't move it. On
// Android the content already starts below the app bar, so the top edge adds nothing there.
const TOP_EDGES = ["top"] as const;

export default function Live() {
  const { session } = useSessionData();
  const { live } = useLive();
  const { favouriteDriverCode } = usePreferences();

  useScreenHeader({
    title: session?.meeting ?? "",
    subtitle: live && session ? `${session.name} · Lap ${live.state.lap}/${live.state.totalLaps}` : undefined,
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={TOP_EDGES} mode="margin" style={styles.screen}>
        {/* Widgets and the track map go here, above the collapsed sheet. */}
        <View style={styles.reserved} />
        <LiveTimingSheet
          entries={toTimingEntries(session, live?.state)}
          favouriteCode={favouriteDriverCode ?? undefined}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  reserved: {
    flex: 1,
  },
});
