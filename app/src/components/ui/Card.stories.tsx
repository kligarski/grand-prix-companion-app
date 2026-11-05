import type { Meta, StoryObj } from "@storybook/react-native";

import { AppText } from "./AppText";
import { Card } from "./Card";
import { LiveBadge } from "./LiveBadge";
import { SectionHeader } from "./SectionHeader";

const meta = {
  title: "UI/Card",
  component: Card,
  args: {
    variant: "surface",
  },
  argTypes: {
    variant: { control: "select", options: ["surface", "elevated"] },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LiveSession: Story = {
  render: (args) => (
    <Card {...args}>
      <LiveBadge label="LIVE NOW" />
      <AppText variant="title">Harbour GP</AppText>
      <AppText variant="callout" color="textSecondary">
        Race · Lap 34 of 58 · Safety car
      </AppText>
    </Card>
  ),
};

export const WithSectionHeader: Story = {
  render: (args) => (
    <Card {...args}>
      <SectionHeader title="This weekend" accessory="Times in your time zone" />
      <AppText color="textSecondary">Card content</AppText>
    </Card>
  ),
};

export const HeaderWithSubtitle: Story = {
  render: () => <SectionHeader title="Timing" subtitle="Interval to car ahead" />,
};
