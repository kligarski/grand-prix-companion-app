import { useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect } from "react";

import { useTheme } from "@/theme";

type Options = {
  title: string;
  subtitle?: string;
  /** A large title that collapses on scroll: iOS large title, Android Material large app bar. */
  large?: boolean;
};

/**
 * Sets a pushed screen's native header: title, subtitle and, on Android, the app background instead
 * of Material's tinted surface, matching the dashboard. Options merge shallowly, so this sets the
 * whole `unstable_headerConfig`.
 */
export function useScreenHeader({ title, subtitle, large = false }: Options) {
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      unstable_headerConfig: {
        subtitle,
        ios: large ? { largeTitleEnabled: true } : undefined,
        android: {
          // Always a valid value: RN Screens throws when an update resets `type` to undefined.
          type: large ? "large" : "small",
          backgroundColor: colors.background,
          scrolledBackgroundColor: colors.background,
        },
      },
    });
  }, [navigation, title, subtitle, large, colors.background]);
}
