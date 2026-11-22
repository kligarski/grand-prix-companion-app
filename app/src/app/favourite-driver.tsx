import { Host } from "@expo/ui";
import { Text as ComposeText, TextButton } from "@expo/ui/jetpack-compose";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DriverPicker } from "@/components/DriverPicker";
import { useScreenHeader } from "@/hooks/useScreenHeader";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { spacing, useTheme } from "@/theme";

/** A text button pinned under the grid, like onboarding's "Skip for now". */
function NoFavouriteButton({ onPress }: { onPress: () => void }) {
  const { scheme, colors } = useTheme();

  if (Platform.OS === "ios") {
    return (
      <Host matchContents={{ vertical: true }} colorScheme={scheme}>
        <SwiftUIButton onPress={onPress} modifiers={[buttonStyle("borderless"), controlSize("large"), tint(colors.link)]}>
          <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>No favourite</SwiftUIText>
        </SwiftUIButton>
      </Host>
    );
  }

  return (
    <View style={styles.buttonAndroid}>
      <Host matchContents colorScheme={scheme}>
        <TextButton onClick={onPress} colors={{ contentColor: colors.link }}>
          <ComposeText>No favourite</ComposeText>
        </TextButton>
      </Host>
    </View>
  );
}

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
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <NoFavouriteButton onPress={() => choose(null)} />
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
  buttonAndroid: {
    alignItems: "center",
  },
});
