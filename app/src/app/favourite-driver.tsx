import { router } from "expo-router";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DriverPicker } from "@/components/DriverPicker";
import { TextLinkButton } from "@/components/TextLinkButton";
import { useScreenHeader } from "@/hooks/useScreenHeader";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { spacing } from "@/theme";

/** Pushed from Settings. Picking a driver, or none, saves it and goes back. */
export default function FavouriteDriver() {
  useScreenHeader({ title: "Favourite driver" });
  const { favouriteDriverCode, setFavouriteDriver } = usePreferences();

  const choose = (code: string | null) => {
    setFavouriteDriver(code);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <DriverPicker selectedCode={favouriteDriverCode} onSelect={choose} />
      </ScrollView>
      {/* Pinned under the grid, like onboarding's "Skip for now"; centred on Android, full width on iOS. */}
      <SafeAreaView edges={["bottom"]} style={[styles.footer, Platform.OS === "android" && styles.footerAndroid]}>
        <TextLinkButton label="No favourite" onPress={() => choose(null)} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  footerAndroid: {
    alignItems: "center",
  },
});
