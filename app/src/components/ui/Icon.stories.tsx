import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { spacing } from "@/theme";

import { AppText } from "./AppText";
import { Icon, iconNames } from "./Icon";

const meta = {
  title: "UI/Icon",
  component: Icon,
  args: {
    name: "settings",
    size: 24,
    color: "text",
  },
  argTypes: {
    name: { control: "select", options: iconNames },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllIcons: Story = {
  render: () => (
    <View style={styles.grid}>
      {iconNames.map((name) => (
        <View key={name} style={styles.cell}>
          <Icon name={name} size={24} />
          <AppText variant="caption" color="textSecondary">
            {name}
          </AppText>
        </View>
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  cell: {
    width: 72,
    alignItems: "center",
    gap: spacing.xs,
  },
});
