import { Host } from "@expo/ui";
import { Button as ComposeButton, Text as ComposeText } from "@expo/ui/jetpack-compose";
import { Button as SwiftUIButton, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { buttonStyle, controlSize, disabled, frame, tint } from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DriverPicker } from "@/components/DriverPicker";
import { TextLinkButton } from "@/components/TextLinkButton";
import { AppText } from "@/components/ui";
import { usePreferences } from "@/preferences/PreferencesProvider";
import { createThemedStyles, palette, spacing, useTheme } from "@/theme";

type FooterProps = {
  selectedCode: string | null;
  onContinue: () => void;
  onSkip: () => void;
};

/** iOS: a full-width filled button over a centred text button. Android: text button and filled pill in a row. */
function Footer({ selectedCode, onContinue, onSkip }: FooterProps) {
  const { scheme, colors } = useTheme();
  const continueLabel = selectedCode ? `Continue with ${selectedCode}` : "Continue";

  if (Platform.OS === "ios") {
    return (
      <View style={styles.footerIos}>
        <Host matchContents={{ vertical: true }} colorScheme={scheme}>
          <SwiftUIButton
            onPress={onContinue}
            modifiers={[
              buttonStyle("borderedProminent"),
              controlSize("large"),
              tint(palette.brand),
              disabled(!selectedCode),
            ]}
          >
            <SwiftUIText modifiers={[frame({ maxWidth: Infinity })]}>{continueLabel}</SwiftUIText>
          </SwiftUIButton>
        </Host>
        <TextLinkButton label="Skip for now" onPress={onSkip} iosColor={colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.footerAndroid}>
      <TextLinkButton label="Skip for now" onPress={onSkip} />
      <Host matchContents colorScheme={scheme}>
        <ComposeButton
          onClick={onContinue}
          enabled={selectedCode !== null}
          colors={{ containerColor: palette.brand, contentColor: palette.white }}
          contentPadding={BUTTON_PADDING}
        >
          <ComposeText>{continueLabel}</ComposeText>
        </ComposeButton>
      </Host>
    </View>
  );
}

export default function Onboarding() {
  const themedStyles = useStyles();
  const { favouriteDriverCode, completeOnboarding } = usePreferences();
  const [selectedCode, setSelectedCode] = useState(favouriteDriverCode);

  return (
    <SafeAreaView style={themedStyles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <AppText variant="largeTitle" accessibilityRole="header">
            Pick your driver
          </AppText>
          <AppText variant="body" color="textSecondary">
            {"We'll keep them highlighted in results, standings and live timing."}
          </AppText>
        </View>
        <DriverPicker selectedCode={selectedCode} onSelect={setSelectedCode} />
      </ScrollView>
      <Footer
        selectedCode={selectedCode}
        onContinue={() => selectedCode && completeOnboarding(selectedCode)}
        onSkip={() => completeOnboarding(null)}
      />
    </SafeAreaView>
  );
}

const BUTTON_PADDING = { start: spacing.xxl, end: spacing.xxl, top: spacing.lg, bottom: spacing.lg };

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  },
  intro: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  footerIos: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  footerAndroid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});

const useStyles = createThemedStyles(({ colors }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));
