import type { Meta, StoryObj } from "@storybook/react-native";
import { StyleSheet, View } from "react-native";

import { spacing, teamColors } from "@/theme";

import { LiveBadge } from "./LiveBadge";
import { PositionBadge } from "./PositionBadge";
import { TeamStripe } from "./TeamStripe";
import { TyreBadge, type TyreCompound } from "./TyreBadge";

const compounds: TyreCompound[] = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];

const meta = {
  title: "UI/Badges",
  component: PositionBadge,
  args: {
    position: 12,
    size: "md",
  },
  argTypes: {
    size: { control: "select", options: ["md", "lg"] },
  },
} satisfies Meta<typeof PositionBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Position: Story = {};

export const Tyres: Story = {
  render: () => (
    <View style={styles.row}>
      {compounds.map((compound) => (
        <TyreBadge key={compound} compound={compound} />
      ))}
    </View>
  ),
};

export const Live: Story = {
  render: () => (
    <View style={styles.column}>
      <LiveBadge />
      <LiveBadge label="LIVE NOW" />
    </View>
  ),
};

export const TeamStripes: Story = {
  render: () => (
    <View style={styles.row}>
      {Object.values(teamColors).map((color) => (
        <TeamStripe key={color} color={color} />
      ))}
    </View>
  ),
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  column: {
    gap: spacing.md,
  },
});
