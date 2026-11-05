import type { Meta, StoryObj } from "@storybook/react-native";
import { fn } from "storybook/test";

import { teamColors } from "@/theme";

import { DriverRow } from "./DriverRow";
import { SectorSplits } from "./SectorSplits";
import { TyreBadge } from "./TyreBadge";

const meta = {
  title: "UI/DriverRow",
  component: DriverRow,
  args: {
    position: 2,
    code: "OKO",
    name: "Okoro",
    teamColor: teamColors.borealis,
    value: "+0.118",
    isFavourite: false,
  },
} satisfies Meta<typeof DriverRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Result: Story = {};

export const Favourite: Story = {
  args: {
    position: 12,
    code: "KOV",
    name: "Kovač",
    teamColor: teamColors.fjord,
    value: "+1.032",
    isFavourite: true,
  },
};

export const TimingWithTyre: Story = {
  args: {
    name: undefined,
    value: "+0.412",
    onPress: fn(),
  },
  render: (args) => <DriverRow {...args} trailing={<TyreBadge compound="HARD" />} />,
};

export const Expanded: Story = {
  args: {
    name: undefined,
    value: "+0.412",
    onPress: fn(),
  },
  render: (args) => (
    <DriverRow {...args} trailing={<TyreBadge compound="HARD" />}>
      <SectorSplits
        sectors={[
          { label: "S1 28.114", note: "Personal best", status: "personalBest" },
          { label: "S2 34.902", note: "Session best", status: "sessionBest" },
          { label: "S3 —", note: "Safety car", status: "none" },
        ]}
      />
    </DriverRow>
  ),
};
