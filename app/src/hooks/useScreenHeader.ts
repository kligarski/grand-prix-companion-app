import { useNavigation, type ExperimentalStackNavigationProp } from "expo-router";
import { useLayoutEffect } from "react";

import { useTheme } from "@/theme";

type Options = {
  title: string;
  subtitle?: string;
};

/**
 * Sets a pushed screen's native header: title, subtitle and, on Android, the app background instead
 * of Material's tinted surface, matching the dashboard. Options merge shallowly, so this sets the
 * whole `unstable_headerConfig`.
 */
export function useScreenHeader({ title, subtitle }: Options) {
  const navigation = useNavigation<ExperimentalStackNavigationProp<ReactNavigation.RootParamList>>();
  const { colors } = useTheme();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      unstable_headerConfig: {
        subtitle,
        android: { backgroundColor: colors.background, scrolledBackgroundColor: colors.background },
      },
    });
  }, [navigation, title, subtitle, colors.background]);
}
