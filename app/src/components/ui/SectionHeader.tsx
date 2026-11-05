import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/theme";

import { AppText } from "./AppText";

type Props = {
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
};

export function SectionHeader({ title, subtitle, accessory }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <AppText variant="title" accessibilityRole="header">
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="footnote" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {typeof accessory === "string" ? (
        <AppText variant="footnote" color="textSecondary">
          {accessory}
        </AppText>
      ) : (
        accessory
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  titles: {
    flex: 1,
  },
});
