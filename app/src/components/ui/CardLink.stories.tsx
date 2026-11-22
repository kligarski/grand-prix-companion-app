import type { Meta, StoryObj } from "@storybook/react-native";

import { AppText } from "./AppText";
import { Card } from "./Card";
import { CardLink } from "./CardLink";

const meta = {
  title: "UI/CardLink",
  component: CardLink,
  args: {
    label: "Full results",
    onPress: () => {},
  },
  decorators: [
    (Story) => (
      <Card>
        <AppText variant="title">Results</AppText>
        <AppText color="textSecondary">Card content</AppText>
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof CardLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullResults: Story = {};

export const FullStandings: Story = {
  args: {
    label: "Full standings",
    accessibilityLabel: "Full standings, drivers",
  },
};
